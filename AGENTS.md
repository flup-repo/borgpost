# AGENTS.md - BorgPost Project Rules & Guidelines

## Project Overview
**BorgPost** is an automated social media management tool built with Node.js + TypeScript + NestJS (backend) and React + TypeScript (frontend). This document defines the rules, conventions, and workflows for all contributors and AI agents working on this project.

**Repository**: Public GitHub repository
**License**: To be determined
**Stack**: Node.js 20, TypeScript 5.3+, NestJS 10+, React 18+, PostgreSQL, Redis, BullMQ

---

## 1. Git Workflow (Gitflow)

### 1.1 Branch Strategy

**Main Branches**:
- `main` - Production-ready code only. Protected branch.
- `develop` - Integration branch for features. Protected branch.

**Supporting Branches**:
- `feature/*` - New features and enhancements
- `bugfix/*` - Bug fixes for develop branch
- `hotfix/*` - Urgent fixes for production (branches from main)
- `release/*` - Release preparation (branches from develop)
- `chore/*` - Maintenance tasks (dependency updates, tooling)
- `docs/*` - Documentation updates

### 1.2 Branch Naming Convention

**Format**: `<type>/<ticket-id>-<short-description>`

**Examples**:
```
feature/BP-123-add-twitter-integration
bugfix/BP-456-fix-post-scheduling
hotfix/BP-789-critical-api-error
chore/BP-012-update-dependencies
docs/BP-034-update-api-documentation
release/v1.0.0
```

**Rules**:
- Use lowercase and hyphens (kebab-case)
- Keep descriptions short but meaningful (max 50 chars)
- Include ticket/issue number if applicable
- Never commit directly to `main` or `develop`

### 1.3 Branch Lifecycle

1. **Create Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/BP-123-add-rss-parser
   ```

2. **Work on Feature**:
   - Make atomic commits with clear messages
   - Push regularly to remote
   - Keep branch up-to-date with develop

3. **Update from Develop** (if branch is long-lived):
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/BP-123-add-rss-parser
   git rebase develop
   ```

4. **Create Pull Request**:
   - Target: `develop` (or `main` for hotfixes)
   - Fill out PR template completely
   - Request reviews from maintainers
   - Ensure CI/CD checks pass

5. **After Merge**:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/BP-123-add-rss-parser
   ```

### 1.4 Protected Branch Rules

**`main` Branch**:
- Requires pull request reviews (min 1 approval)
- Requires status checks to pass
- No force pushes allowed
- No direct commits allowed
- Only merge from `release/*` or `hotfix/*`

**`develop` Branch**:
- Requires pull request reviews (min 1 approval)
- Requires status checks to pass
- No force pushes allowed
- No direct commits allowed
- Only merge from `feature/*`, `bugfix/*`, `chore/*`

---

## 2. Commit Message Standards

### 2.1 Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2.2 Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring (no functional changes)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config)
- `ci`: CI/CD configuration changes
- `revert`: Reverting previous commits

### 2.3 Scopes (Optional)

- `backend`: Backend (NestJS) changes
- `frontend`: Frontend (React) changes
- `api`: API endpoint changes
- `db`: Database schema/migrations
- `jobs`: Background job processors
- `twitter`: Twitter/X integration
- `gemini`: Gemini AI integration
- `ui`: UI components
- `config`: Configuration changes

### 2.4 Examples

**Good Commits**:
```
feat(backend): add Twitter OAuth authentication

Implement OAuth 1.0a flow for Twitter API authentication.
Includes TwitterService with credential validation and 
connection testing endpoint.

Closes #123

---

fix(jobs): resolve race condition in post executor

Fixed issue where multiple instances of PostExecutorProcessor
could process the same post simultaneously. Added database 
locking mechanism using TypeORM pessimistic locking.

Fixes #456

---

docs: update API documentation for posts endpoints

Added request/response examples for all post management
endpoints. Updated OpenAPI/Swagger annotations.

---

chore(deps): update NestJS to v10.3.2

Security patch release. No breaking changes.
```

**Bad Commits** (avoid these):
```
❌ Fixed stuff
❌ WIP
❌ Updated files
❌ asdf
❌ Final fix (this time for real)
```

### 2.5 Commit Guidelines

- **Atomic commits**: Each commit should represent one logical change
- **Subject line**: 
  - Max 72 characters
  - Imperative mood ("add" not "added")
  - No period at the end
  - Capitalize first letter
- **Body**: 
  - Wrap at 72 characters
  - Explain *what* and *why*, not *how*
  - Separate from subject with blank line
- **Footer**: Reference issues/PRs (e.g., "Closes #123", "Fixes #456")

---

## 3. Code Style & Conventions

### 3.1 TypeScript Standards

**General Rules**:
- Use TypeScript strict mode (`strict: true` in tsconfig.json)
- Never use `any` type (use `unknown` if type is truly unknown)
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` only when reassignment is needed
- Never use `var`

**Naming Conventions**:
```typescript
// Classes, Interfaces, Types, Enums: PascalCase
class PostService { }
interface PostEntity { }
type PostStatus = 'DRAFT' | 'SCHEDULED' | 'POSTED';
enum PostStatus { DRAFT, SCHEDULED, POSTED }

// Variables, functions, methods: camelCase
const userName = 'john';
function getUserPosts() { }
const calculateEngagement = () => { };

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEZONE = 'UTC';

// Private properties: prefix with underscore
private _cachedPosts: Post[];

// Boolean variables: prefix with is/has/should
const isActive = true;
const hasPermission = false;
const shouldRetry = true;

// Files: kebab-case
post-executor.processor.ts
twitter.service.ts
```

**Code Organization**:
```typescript
// Order of class members:
export class PostService {
  // 1. Static properties
  static readonly MAX_POSTS = 100;

  // 2. Instance properties (public first, then private)
  public readonly logger: Logger;
  private _cache: Map<string, Post>;

  // 3. Constructor
  constructor(private readonly postRepository: Repository<Post>) { }

  // 4. Static methods
  static formatDate(date: Date): string { }

  // 5. Public methods (lifecycle hooks first in NestJS)
  async onModuleInit() { }
  
  async findAll(): Promise<Post[]> { }

  // 6. Private methods
  private async validatePost(post: Post): Promise<void> { }
}
```

### 3.2 NestJS Backend Conventions

**Module Structure**:
```typescript
// posts/posts.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Post, Category])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService], // Export if used by other modules
})
export class PostsModule {}
```

**Controller Conventions**:
```typescript
@Controller('api/posts')
@ApiTags('posts') // Swagger documentation
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  async findAll(
    @Query() query: PostQueryDto,
  ): Promise<PostResponseDto[]> {
    return this.postsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  async create(
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostResponseDto> {
    return this.postsService.create(createPostDto);
  }
}
```

**Service Conventions**:
```typescript
@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly twitterService: TwitterService,
  ) {}

  async findAll(query: PostQueryDto): Promise<Post[]> {
    this.logger.debug(`Finding posts with query: ${JSON.stringify(query)}`);
    return this.postRepository.find({ where: query });
  }
}
```

**Entity Conventions**:
```typescript
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  @IsNotEmpty()
  content: string;

  @Column({ type: 'varchar', length: 20 })
  status: PostStatus;

  @ManyToOne(() => Category, category => category.posts)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**DTO Conventions**:
```typescript
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @ApiProperty({ description: 'Post content', example: 'Check out this tweet!' })
  content: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional({ description: 'Media URL' })
  mediaUrl?: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'Category ID' })
  categoryId: number;
}
```

### 3.3 React Frontend Conventions

**Component Structure**:
```typescript
// components/PostCard/PostCard.tsx
import { FC } from 'react';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (id: number) => void;
}

export const PostCard: FC<PostCardProps> = ({ post, onEdit, onDelete }) => {
  return (
    <div className="post-card">
      {/* Component JSX */}
    </div>
  );
};
```

**Hooks Conventions**:
```typescript
// hooks/usePosts.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export const usePosts = () => {
  const query = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return { ...query, createPost: createMutation.mutate };
};
```

**File Organization**:
```
components/
├── PostCard/
│   ├── PostCard.tsx        # Component implementation
│   ├── PostCard.test.tsx   # Tests
│   ├── PostCard.stories.tsx # Storybook (optional)
│   └── index.ts            # Export
```

### 3.4 Code Quality Tools

**ESLint** (enforced in CI/CD):
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

**Prettier** (enforced in pre-commit hook):
```bash
npm run format      # Format all files
npm run format:check # Check formatting
```

**TypeScript**:
```bash
npm run typecheck   # Type checking without compilation
```

---

## 4. Testing Requirements

### 4.1 Test Coverage Requirements

- **Minimum coverage**: 70% overall
- **Critical paths**: 90%+ coverage (auth, payment, data integrity)
- **New features**: Must include tests before PR approval

### 4.2 Backend Testing (Jest)

**Unit Tests**:
```typescript
// posts.service.spec.ts
describe('PostsService', () => {
  let service: PostsService;
  let repository: Repository<Post>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useClass: MockRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get(getRepositoryToken(Post));
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      const dto = { content: 'Test post', categoryId: 1 };
      jest.spyOn(repository, 'save').mockResolvedValue({ id: 1, ...dto } as Post);

      const result = await service.create(dto);

      expect(result.content).toBe(dto.content);
      expect(repository.save).toHaveBeenCalledWith(dto);
    });
  });
});
```

**Integration Tests**:
```typescript
// posts.controller.e2e-spec.ts
describe('PostsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/posts (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/posts')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

### 4.3 Frontend Testing (React Testing Library)

```typescript
// PostCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from './PostCard';

describe('PostCard', () => {
  const mockPost = {
    id: 1,
    content: 'Test post',
    status: 'SCHEDULED',
  };

  it('renders post content', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test post')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<PostCard post={mockPost} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockPost);
  });
});
```

### 4.4 Test File Naming

- Unit tests: `*.spec.ts` (e.g., `posts.service.spec.ts`)
- Integration tests: `*.e2e-spec.ts` (e.g., `posts.controller.e2e-spec.ts`)
- Frontend tests: `*.test.tsx` (e.g., `PostCard.test.tsx`)

---

## 5. Pull Request Guidelines

### 5.1 PR Title Format

Follow commit message format:
```
feat(backend): add Twitter thread splitting logic
fix(frontend): resolve infinite loop in useEffect
docs: update deployment documentation
```

### 5.2 PR Description Template

```markdown
## Description
Brief description of changes (what and why)

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Dependency update

## Related Issues
Closes #123
Relates to #456

## Changes Made
- Added Twitter thread splitting logic in TwitterService
- Updated Post entity to support thread metadata
- Added unit tests for thread splitting algorithm

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code commented where necessary
- [ ] Documentation updated (if applicable)
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] No secrets or sensitive data in code
- [ ] Migration script created (if DB changes)

## Screenshots (if applicable)
[Add screenshots here]

## Additional Notes
[Any additional information]
```

### 5.3 PR Review Process

**Before Creating PR**:
1. Run all tests locally: `npm test`
2. Run linter: `npm run lint`
3. Run type checker: `npm run typecheck`
4. Test changes manually
5. Ensure no sensitive data (API keys, passwords) in code
6. Update documentation if needed

**Review Requirements**:
- At least 1 approval from maintainer
- All CI/CD checks must pass
- No unresolved conversations
- No merge conflicts with target branch

**Reviewer Checklist**:
- [ ] Code follows style guidelines
- [ ] Logic is sound and efficient
- [ ] Tests are adequate and passing
- [ ] No security vulnerabilities introduced
- [ ] Documentation is updated
- [ ] No hardcoded secrets or sensitive data
- [ ] Error handling is appropriate
- [ ] Database migrations are safe (if applicable)

### 5.4 PR Size Guidelines

- **Small PR**: < 200 lines changed (preferred)
- **Medium PR**: 200-500 lines changed
- **Large PR**: > 500 lines changed (should be split if possible)

**Large PRs**:
- Must include detailed description
- Consider breaking into smaller PRs
- May require multiple reviewers

---

## 6. Security Requirements

### 6.1 Secrets Management

**NEVER commit**:
- API keys (Gemini, Twitter, OpenAI)
- Database credentials
- OAuth tokens
- Private keys
- Passwords
- `.env` files

**Always**:
- Use `.env` for local development
- Use environment variables in production
- Use `.env.example` for documentation (with placeholder values)
- Encrypt sensitive data in database (API keys in configurations table)

### 6.2 Code Security Checklist

Before committing:
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] SQL injection protection (use parameterized queries)
- [ ] XSS protection (sanitize user-generated content)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented for API endpoints
- [ ] Authentication/authorization properly implemented
- [ ] Dependencies are up-to-date and secure (`npm audit`)

### 6.3 Security Review

Any PR involving:
- Authentication/authorization
- Payment processing
- External API integrations
- Data encryption
- User data handling

Must be reviewed by security-conscious maintainer.

---

## 7. Database Migrations

### 7.1 Migration Rules

1. **Never edit existing migrations** - always create new ones
2. **Test migrations both up and down** (if supported)
3. **Migrations must be reversible** when possible
4. **Include seed data** for new required fields
5. **Test on copy of production data** before deploying

### 7.2 Creating Migrations

```bash
# Generate migration after entity changes
npm run migration:generate -- -n CreatePostsTable

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### 7.3 Migration File Template

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostsTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE posts`);
  }
}
```

---

## 8. Documentation Requirements

### 8.1 Code Documentation

**TypeScript/JSDoc Comments**:
```typescript
/**
 * Generates and posts content to Twitter based on schedule slots
 * 
 * @param slotId - The schedule slot ID to fill
 * @param categoryId - Optional category to use for content generation
 * @returns Promise<Post> The created and posted tweet
 * @throws {RateLimitError} If Twitter API rate limit is reached
 * @throws {InvalidCredentialsError} If Twitter credentials are invalid
 * 
 * @example
 * ```typescript
 * const post = await postExecutor.executePost(123, 456);
 * console.log(`Posted tweet with ID: ${post.externalId}`);
 * ```
 */
async executePost(slotId: number, categoryId?: number): Promise<Post> {
  // Implementation
}
```

**When to add comments**:
- Complex algorithms or business logic
- Non-obvious workarounds or hacks
- Performance-critical sections
- Public API methods/classes
- **Don't comment obvious code** - code should be self-documenting

### 8.2 README Updates

Update README.md when adding:
- New features
- New dependencies
- New environment variables
- New deployment steps
- Breaking changes

### 8.3 API Documentation

- Use OpenAPI/Swagger annotations on all endpoints
- Keep `docs/api.md` updated with examples
- Document request/response formats
- Document error responses

---

## 9. Dependency Management

### 9.1 Adding Dependencies

**Before adding a new dependency**:
1. Check if existing dependency can solve the problem
2. Verify package is actively maintained
3. Check for security vulnerabilities
4. Consider bundle size impact (for frontend)
5. Get approval from maintainer for large/critical dependencies

### 9.2 Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update to latest within semver range
npm update

# Update to latest (breaking changes possible)
npm install <package>@latest

# Check for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix
```

**Rules**:
- Update dependencies regularly (weekly/bi-weekly)
- Test thoroughly after major version updates
- Create separate PR for dependency updates
- Use `chore(deps):` commit prefix

---

## 10. Environment-Specific Rules

### 10.1 Development

- SQLite database is acceptable
- Redis can be local or Docker
- Detailed logging enabled (DEBUG level)
- Hot reload enabled for rapid development

### 10.2 Production

- Must use PostgreSQL
- Must use Redis (managed service recommended)
- Logging at INFO level (ERROR for critical paths)
- Environment variables properly configured
- Database backups enabled
- Monitoring and alerts configured

---

## 11. AI Agent Specific Guidelines

### 11.1 When Generating Code

1. **Always follow the established patterns** in the codebase
2. **Use TypeScript strict mode** - no `any` types
3. **Include error handling** for all async operations
4. **Add JSDoc comments** for public methods
5. **Follow NestJS dependency injection** patterns
6. **Use proper TypeORM decorators** for entities
7. **Include validation decorators** on DTOs
8. **Write tests** for new functionality
9. **Update documentation** when adding features
10. **Check for existing similar code** before creating new

### 11.2 When Refactoring

1. **Maintain backward compatibility** unless explicitly told otherwise
2. **Keep changes focused** - one logical change per commit
3. **Don't mix refactoring with new features** in the same PR
4. **Ensure all tests still pass** after refactoring
5. **Update related tests** if behavior changes

### 11.3 When Fixing Bugs

1. **Reproduce the bug** first (add a failing test)
2. **Fix the root cause**, not just the symptoms
3. **Add regression tests** to prevent recurrence
4. **Update error messages** to be more helpful
5. **Document the fix** in commit message

### 11.4 When Reviewing Code

1. **Check for security issues** (secrets, injection vulnerabilities)
2. **Verify test coverage** is adequate
3. **Ensure code follows style guidelines**
4. **Look for performance issues** (N+1 queries, inefficient algorithms)
5. **Verify error handling** is comprehensive
6. **Check for code duplication**
7. **Ensure documentation is updated**

---

## 12. Prohibited Practices

### 12.1 Never Do This

❌ **Commit directly to `main` or `develop`**
❌ **Force push to shared branches**
❌ **Commit secrets or API keys**
❌ **Merge without PR review**
❌ **Skip tests or disable test checks**
❌ **Leave `console.log` statements in production code**
❌ **Use `any` type in TypeScript**
❌ **Ignore ESLint warnings**
❌ **Commit commented-out code**
❌ **Commit `node_modules/` or build artifacts**
❌ **Merge with failing tests or linter errors**
❌ **Deploy without testing on staging first**

### 12.2 Code Smells to Avoid

- Long methods (> 50 lines)
- Deep nesting (> 3 levels)
- Large files (> 500 lines)
- God classes (too many responsibilities)
- Magic numbers (use named constants)
- Callback hell (use async/await)
- Copy-paste code (extract to shared function)

---

## 13. Release Process

### 13.1 Release Branch Workflow

1. **Create release branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.2.0
   ```

2. **Prepare release**:
   - Update version in `package.json`
   - Update CHANGELOG.md
   - Run full test suite
   - Fix any bugs found

3. **Merge to main**:
   ```bash
   git checkout main
   git merge --no-ff release/v1.2.0
   git tag -a v1.2.0 -m "Release version 1.2.0"
   git push origin main --tags
   ```

4. **Merge back to develop**:
   ```bash
   git checkout develop
   git merge --no-ff release/v1.2.0
   git push origin develop
   ```

5. **Delete release branch**:
   ```bash
   git branch -d release/v1.2.0
   ```

### 13.2 Hotfix Workflow

1. **Create hotfix branch** from `main`:
   ```bash
   git checkout main
   git checkout -b hotfix/v1.2.1-critical-bug
   ```

2. **Fix the issue** and test thoroughly

3. **Merge to main**:
   ```bash
   git checkout main
   git merge --no-ff hotfix/v1.2.1-critical-bug
   git tag -a v1.2.1 -m "Hotfix: Critical bug"
   git push origin main --tags
   ```

4. **Merge to develop**:
   ```bash
   git checkout develop
   git merge --no-ff hotfix/v1.2.1-critical-bug
   git push origin develop
   ```

---

## 14. Communication & Collaboration

### 14.1 Issue Reporting

When creating issues:
- Use clear, descriptive titles
- Include reproduction steps for bugs
- Provide environment details
- Add relevant labels
- Link related issues/PRs

### 14.2 PR Discussions

- Be respectful and constructive
- Ask questions if something is unclear
- Provide rationale for suggestions
- Use GitHub's suggestion feature for code changes
- Resolve conversations when addressed

### 14.3 Documentation

- Keep documentation up-to-date
- Use clear, concise language
- Include examples where helpful
- Document breaking changes prominently

---

## 15. Continuous Integration/Deployment

### 15.1 CI Pipeline

Every PR must pass:
- ✅ Linting (`npm run lint`)
- ✅ Type checking (`npm run typecheck`)
- ✅ Unit tests (`npm test`)
- ✅ Integration tests
- ✅ Build succeeds (`npm run build`)
- ✅ Security audit (`npm audit`)

### 15.2 CD Pipeline

Deployments to:
- **Staging**: Automatic on merge to `develop`
- **Production**: Automatic on merge to `main` (with approval gate)

---

## Summary

Following these guidelines ensures:
- ✅ Consistent, high-quality code
- ✅ Smooth collaboration
- ✅ Easier maintenance and debugging
- ✅ Better security practices
- ✅ Faster onboarding for new contributors
- ✅ Professional, production-ready codebase

**When in doubt**: Ask maintainers or refer to existing code patterns in the project.
