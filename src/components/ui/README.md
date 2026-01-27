# State Components

Reusable state components for consistent UX patterns across the InstaGrow app.

## Components

### EmptyState

Displays an empty state with icon, title, description, and optional CTA button.

**Props:**
- `icon: React.ReactNode` - Icon to display in circle container
- `title: string` - Main heading
- `description: string` - Subtext description
- `actionLabel?: string` - Button text (optional)
- `actionHref?: string` - URL to navigate to on click (optional)
- `onAction?: () => void` - Callback function on click (optional)

**Usage:**
```tsx
import { EmptyState } from '@/components/ui';

export function MyComponent() {
  return (
    <EmptyState
      icon="📝"
      title="No content yet"
      description="Create your first post to get started"
      actionLabel="Create Post"
      onAction={() => navigateToCreate()}
    />
  );
}
```

---

### LoadingState

Displays loading UI with two variants: animated spinner or skeleton placeholders.

**Props:**
- `variant: 'spinner' | 'skeleton'` - Loading display type
- `text?: string` - Optional text below spinner (only for 'spinner' variant)

**Usage - Spinner:**
```tsx
import { LoadingState } from '@/components/ui';

export function MyComponent() {
  return <LoadingState variant="spinner" text="Loading your posts..." />;
}
```

**Usage - Skeleton:**
```tsx
import { LoadingState } from '@/components/ui';

export function MyComponent() {
  return <LoadingState variant="skeleton" />;
}
```

---

### ErrorState

Displays error message with icon and optional retry button.

**Props:**
- `title: string` - Error title/heading
- `description: string` - Error description text
- `onRetry?: () => void` - Callback function for retry button (optional)

**Usage:**
```tsx
import { ErrorState } from '@/components/ui';

export function MyComponent() {
  const handleRetry = async () => {
    // retry logic
  };

  return (
    <ErrorState
      title="Failed to load posts"
      description="Something went wrong. Please try again."
      onRetry={handleRetry}
    />
  );
}
```

---

## Design System

All components use the design tokens from `src/app/globals.css`:

- **Colors:** `--primary`, `--error`, `--text-primary`, `--text-secondary`, `--bg-muted`
- **Spacing:** `--space-4`, `--space-6`, `--space-8`, etc.
- **Typography:** Font sizes and weights from `.heading-md`, `.text-sm`, etc.
- **Button Styles:** `.btn`, `.btn-primary`, `.btn-secondary`

---

## Accessibility

- All components use semantic HTML
- Proper ARIA labels and roles
- Screen reader support with `sr-only` text
- Focus management for buttons
- Respects `prefers-reduced-motion` media query
