import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('LlmService', () => {
  let service: LlmService;
  let configService: ConfigService;
  
  // Define mocks
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn();

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.useFakeTimers();

    // Setup mocks
    mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    });

    (GoogleGenerativeAI as unknown as jest.Mock).mockImplementation(() => {
      return {
        getGenerativeModel: mockGetGenerativeModel,
      };
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'GEMINI_API_KEY') return 'test-api-key';
              if (key === 'GEMINI_MODEL_PRIMARY') return 'gemini-2.5-pro';
              if (key === 'GEMINI_MODEL_FALLBACK') return 'gemini-2.5-flash';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should succeed on first attempt if primary model works', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => 'Generated content' },
    });

    const result = await service.generate('test prompt');
    expect(result).toBe('Generated content');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed if primary fails initially but works later', async () => {
    // 1st attempt: Primary fails, Fallback fails (triggering retry 1)
    mockGenerateContent.mockRejectedValueOnce(new Error('Primary 1 failed')); // Primary
    mockGenerateContent.mockRejectedValueOnce(new Error('Fallback 1 failed')); // Fallback
    
    // 2nd attempt: Primary works
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => 'Generated content retry' },
    });

    const promise = service.generate('test prompt');
    
    // Fast-forward time for the retry delay
    await jest.advanceTimersByTimeAsync(30000);
    
    const result = await promise;
    expect(result).toBe('Generated content retry');
    // 1st attempt (primary + fallback) + 2nd attempt (primary) = 3 calls
    expect(mockGenerateContent).toHaveBeenCalledTimes(3); 
  });

  it('should use fallback if primary fails', async () => {
    // Primary fails
    mockGenerateContent.mockRejectedValueOnce(new Error('Primary failed'));
    // Fallback succeeds
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => 'Fallback content' },
    });

    const result = await service.generate('test prompt');
    expect(result).toBe('Fallback content');
    // Called twice: once for primary, once for fallback
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    // Fail all 5 attempts (primary + fallback for each attempt)
    // 5 attempts * 2 calls (primary + fallback) = 10 failures
    // We mocking rejected value 10 times
    for (let i = 0; i < 10; i++) {
        mockGenerateContent.mockRejectedValueOnce(new Error('Failed'));
    }

    const promise = service.generate('test prompt');
    
    // We expect the promise to reject eventually
    const assertion = expect(promise).rejects.toThrow('Failed');

    // Advance time for all retries (4 delays of 30s)
    for(let i=0; i<4; i++) {
        await jest.advanceTimersByTimeAsync(30000);
    }

    await assertion;
    expect(mockGenerateContent).toHaveBeenCalledTimes(10); 
  });
});
