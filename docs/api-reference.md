# API Reference

Comprehensive documentation for every public-facing module in the virtual try-on project. Each section details the symbol’s purpose, props or parameters, return values, side effects, and example usage.

> **Conventions**
>
> - Import paths assume calls from the project root using Vite path resolution.
> - Example snippets focus on the public surface only; omit unrelated state management for brevity.
> - Unless stated otherwise, listed components render in the browser and expect to run in a React 18 environment with Tailwind CSS utilities available.

---

## Components

### `App`

- **Location**: `App.tsx`
- **Description**: Top-level application orchestrating the try-on workflow. Manages model generation, wardrobe state, pose selection, and layout transitions between the onboarding screen and dressing room.
- **Props**: None (stateful container component).
- **Usage**:

```tsx
import App from './App';

export function Root() {
  return <App />;
}
```

### `StartScreen`

- **Location**: `components/StartScreen.tsx`
- **Props**:
  - `onModelFinalized(modelUrl: string)`: Invoked when Gemini returns the generated model image. Typically transitions the app into styling mode.
- **Description**: Handles the onboarding flow where a user uploads a personal photo. Integrates with `generateModelImage`, shows progress, errors, and an interactive before/after comparison.
- **Usage**:

```tsx
import StartScreen from './components/StartScreen';

<StartScreen onModelFinalized={(url) => console.log('Model ready:', url)} />;
```

### `Canvas`

- **Location**: `components/Canvas.tsx`
- **Props**:
  - `displayImageUrl: string | null`: Active image to display (base model or generated try-on result).
  - `onStartOver(): void`: Called when the user resets the experience.
  - `isLoading: boolean`: Toggles spinner/overlay states.
  - `loadingMessage: string`: Optional status text shown during async calls.
  - `onSelectPose(index: number)`: Requests a pose change by index in `poseInstructions`.
  - `poseInstructions: string[]`: Canonical ordering of available poses.
  - `currentPoseIndex: number`: Currently highlighted pose index.
  - `availablePoseKeys: string[]`: Pose captions with generated imagery available for instant preview.
- **Description**: Main viewport displaying the model or loading placeholders. Offers pose navigation controls, hover-activated pose menus, and “Start Over” reset.
- **Usage**:

```tsx
import Canvas from './components/Canvas';

<Canvas
  displayImageUrl={imageUrl}
  onStartOver={() => resetApp()}
  isLoading={loading}
  loadingMessage={loadingMessage}
  onSelectPose={(index) => setPose(index)}
  poseInstructions={["Full frontal", "3/4 view"]}
  currentPoseIndex={currentPose}
  availablePoseKeys={["Full frontal"]}
/>;
```

### `OutfitStack`

- **Location**: `components/OutfitStack.tsx`
- **Props**:
  - `outfitHistory: OutfitLayer[]`: Ordered layers from base model to last applied garment.
  - `onRemoveLastGarment(): void`: Removes the most recent garment layer.
- **Description**: Compact list summarizing the outfit history. Shows thumbnail, name, and allows removing the top-most garment layer.
- **Usage**:

```tsx
import OutfitStack from './components/OutfitStack';

<OutfitStack outfitHistory={layers} onRemoveLastGarment={() => stepBack()} />;
```

### `CurrentOutfitPanel`

- **Location**: `components/CurrentOutfitPanel.tsx`
- **Props**:
  - `outfitHistory: OutfitLayer[]`
  - `onRemoveLastGarment(): void`
  - `onAddGarment(): void`: Opens a wardrobe selector.
- **Description**: Alternate outfit stack with inline “Add Garment” action, suitable for sidebar layouts.
- **Usage**:

```tsx
import CurrentOutfitPanel from './components/CurrentOutfitPanel';

<CurrentOutfitPanel
  outfitHistory={layers}
  onRemoveLastGarment={removeTop}
  onAddGarment={() => setWardrobeOpen(true)}
/>;
```

### `WardrobePanel`

- **Location**: `components/WardrobeModal.tsx`
- **Props**:
  - `onGarmentSelect(file: File, info: WardrobeItem)`: Called after converting an image to a `File` ready for Gemini.
  - `activeGarmentIds: string[]`: Prevents selecting garments already in the active outfit.
  - `isLoading: boolean`: Disables interactions when background requests are running.
  - `wardrobe: WardrobeItem[]`: Items available for selection, typically `defaultWardrobe` plus uploads.
- **Description**: Grid of wardrobe thumbnails with upload support and garment-type confirmation modal. Handles file normalization (including CORS fallbacks) before notifying the parent.
- **Usage**:

```tsx
import WardrobePanel from './components/WardrobeModal';

<WardrobePanel
  onGarmentSelect={handleWardrobePick}
  activeGarmentIds={activeIds}
  isLoading={loading}
  wardrobe={wardrobe}
/>;
```

### `WardrobeModal`

- **Location**: `components/WardrobeSheet.tsx`
- **Props**:
  - `isOpen: boolean`
  - `onClose(): void`
  - `onGarmentSelect(file: File, info: WardrobeItem)`
  - `activeGarmentIds: string[]`
  - `isLoading: boolean`
- **Description**: Full-screen modal version of the wardrobe, preloaded with `defaultWardrobe`. Includes upload option and graceful fade/scale animations via Framer Motion.
- **Usage**:

```tsx
import WardrobeModal from './components/WardrobeSheet';

<WardrobeModal
  isOpen={isWardrobeOpen}
  onClose={() => setWardrobeOpen(false)}
  onGarmentSelect={handleSelect}
  activeGarmentIds={activeIds}
  isLoading={loading}
/>;
```

### `PosePanel`

- **Location**: `components/PosePanel.tsx`
- **Props**:
  - `onPoseSelect(poseInstruction: string)`: Callback fired when users choose a predefined pose.
  - `isLoading: boolean`: Disables buttons during image generation.
- **Description**: Presents quick-access pose buttons. Useful if you need a simplified pose chooser outside the main `Canvas` control set.
- **Usage**:

```tsx
import PosePanel from './components/PosePanel';

<PosePanel onPoseSelect={requestPose} isLoading={loading} />;
```

### `LoadingOverlay`

- **Location**: `components/LoadingOverlay.tsx`
- **Props**: `message: string`
- **Description**: Semi-transparent overlay with centered spinner and message, suitable for blocking interactions within a container.
- **Usage**:

```tsx
import LoadingOverlay from './components/LoadingOverlay';

<div className="relative h-96">
  {isLoading && <LoadingOverlay message="Generating pose..." />}
  {children}
</div>
```

### `Header`

- **Location**: `components/Header.tsx`
- **Props**: None
- **Description**: Minimal top bar with the project title and shirt icon. Use when you need a consistent branding header across pages.

### `Footer`

- **Location**: `components/Footer.tsx`
- **Props**: `isOnDressingScreen?: boolean` (defaults to `false`)
- **Description**: Fixed bottom footer with author attribution. Hidden on small screens when `isOnDressingScreen` is `true` to preserve viewport space.
- **Usage**:

```tsx
import Footer from './components/Footer';

<Footer isOnDressingScreen={Boolean(activeModel)} />;
```

### `Spinner`

- **Location**: `components/Spinner.tsx`
- **Props**: None
- **Description**: SVG-based loading indicator using Tailwind’s `animate-spin` utility. Insert anywhere you need progress indication.

### `Compare`

- **Location**: `components/ui/compare.tsx`
- **Props**:
  - `firstImage?: string`
  - `secondImage?: string`
  - `className?: string`
  - `firstImageClassName?: string`
  - `secondImageClassname?: string`
  - `initialSliderPercentage?: number` (default `50`)
  - `slideMode?: "hover" | "drag"` (default `"hover"`)
  - `showHandlebar?: boolean` (default `true`)
  - `autoplay?: boolean` (default `false`)
  - `autoplayDuration?: number` (milliseconds, default `5000`)
- **Description**: Interactive before/after image comparison with optional auto-play and sparkle accents. Uses Framer Motion for smooth transitions.
- **Usage**:

```tsx
import { Compare } from './components/ui/compare';

<Compare
  firstImage={beforeUrl}
  secondImage={afterUrl}
  className="w-80 aspect-[3/4]"
  slideMode="drag"
  autoplay
  autoplayDuration={8000}
/>;
```

### `SparklesCore`

- **Location**: `components/ui/sparkles.tsx`
- **Props** (all optional):
  - `id`
  - `className`
  - `background`
  - `particleSize`
  - `minSize`
  - `maxSize`
  - `speed`
  - `particleColor`
  - `particleDensity`
- **Description**: Wrapper around `@tsparticles/react` with sensible defaults and fade-in animation. Intended for decorative particle effects behind other content.
- **Usage**:

```tsx
import { SparklesCore } from './components/ui/sparkles';

<div className="relative h-64">
  <SparklesCore className="absolute inset-0" particleColor="#fff8e1" />
  <div className="relative z-10">Spotlight Content</div>
</div>
```

### Icon Components

- **Location**: `components/icons.tsx`
- **Exports**: `ShirtIcon`, `UploadCloudIcon`, `RotateCcwIcon`, `CheckCircleIcon`, `DotsVerticalIcon`, `Trash2Icon`, `ChevronLeftIcon`, `ChevronRightIcon`, `XIcon`, `PlusIcon`, `ChevronUpIcon`, `ChevronDownIcon`.
- **Description**: Stateless SVG components accepting standard `React.SVGProps<SVGSVGElement>`. The icons inherit current color unless overridden.
- **Usage**:

```tsx
import { UploadCloudIcon } from './components/icons';

<button className="inline-flex items-center gap-2">
  <UploadCloudIcon className="w-4 h-4" /> Upload
</button>
```

### Placeholder Components

- **Files**: `components/AdjustmentPanel.tsx`, `components/CropPanel.tsx`, `components/FilterPanel.tsx`
- **Description**: Currently return `null`. Included as extension points for future editing/tool interfaces. Safe to render; they produce no DOM output.
- **Usage**: Optional; conditionally render when expanded functionality is implemented.

```tsx
import AdjustmentPanel from './components/AdjustmentPanel';

// Renders nothing today but keeps the layout API stable.
<AdjustmentPanel />;
```

---

## Utilities & Types

### `cn`

- **Location**: `lib/utils.ts`
- **Signature**: `cn(...inputs: ClassValue[]): string`
- **Description**: Tailwind-aware class name merger using `clsx` + `tailwind-merge`. Deduplicates conflicting utility classes.
- **Example**:

```ts
import { cn } from './lib/utils';

const classes = cn('px-4 py-2', condition && 'bg-gray-900', 'bg-gray-800');
// -> 'px-4 py-2 bg-gray-800'
```

### `getFriendlyErrorMessage`

- **Location**: `lib/utils.ts`
- **Signature**: `getFriendlyErrorMessage(error: unknown, context: string): string`
- **Description**: Normalizes unknown errors into human-readable strings, with special handling for Gemini MIME-type errors.
- **Example**:

```ts
import { getFriendlyErrorMessage } from './lib/utils';

try {
  await generateModelImage(file);
} catch (err) {
  toast.error(getFriendlyErrorMessage(err, 'Failed to create model'));
}
```

### `WardrobeItem`

- **Location**: `types.ts`
- **Shape**:
  - `id: string`
  - `name: string`
  - `url: string`
  - `garmentType?: string`
- **Usage**: Represents garments displayed in wardrobe pickers and layered into outfits.

### `OutfitLayer`

- **Location**: `types.ts`
- **Shape**:
  - `garment: WardrobeItem | null`
  - `poseImages: Record<string, string>` mapping pose instruction to image URL
- **Usage**: Tracks the chronological stack of applied garments and generated pose variants.

### `defaultWardrobe`

- **Location**: `wardrobe.ts`
- **Description**: Starts as an empty array (`WardrobeItem[]`). Use as seed wardrobe or populate before rendering selectors.
- **Example**:

```ts
import { defaultWardrobe } from './wardrobe';

const wardrobe = [...defaultWardrobe, customItem];
```

---

## Gemini Service

> **Environment requirements**: Ensure `VITE_GEMINI_API_KEY` is defined before the Vite dev/build process. These utilities rely on browser `File` APIs and should be invoked on the client.

### `generateModelImage`

- **Signature**: `async function generateModelImage(userImage: File): Promise<string>`
- **Description**: Creates a clean studio-model rendition of a user photo. Compresses the input, retries transient network failures, and returns a data URL string.
- **Example**:

```ts
import { generateModelImage } from './services/geminiService';

const modelUrl = await generateModelImage(userFile);
setModelImageUrl(modelUrl);
```

### `generateVirtualTryOnImage`

- **Signature**: `async function generateVirtualTryOnImage(modelImageUrl: string, garmentImage: File, garmentType?: string): Promise<string>`
- **Description**: Applies an uploaded garment to an existing model image. The first argument must be a data URL (e.g., from `generateModelImage` or prior try-on result). Optionally include `garmentType` to improve prompt accuracy.
- **Example**:

```ts
import { generateVirtualTryOnImage } from './services/geminiService';

const tryOnUrl = await generateVirtualTryOnImage(modelUrl, garmentFile, 'Jacket / Coat');
updateOutfit({ garment, poseImages: { [activePose]: tryOnUrl } });
```

### `generatePoseVariation`

- **Signature**: `async function generatePoseVariation(tryOnImageUrl: string, poseInstruction: string): Promise<string>`
- **Description**: Re-renders the current outfit from a new perspective while preserving the model, garment, and background. Useful for building a pose gallery for a single look.
- **Example**:

```ts
import { generatePoseVariation } from './services/geminiService';

const alternatePoseUrl = await generatePoseVariation(activeLayer.poseImages[basePose], 'Side profile view');
activeLayer.poseImages['Side profile view'] = alternatePoseUrl;
```

### Error Handling Notes

- All Gemini helpers throw `Error` instances with descriptive messages when safety filters trigger or assets fail conversion.
- Use `getFriendlyErrorMessage` to translate technical failures (e.g., unsupported MIME types) into UI-safe strings.
- Built-in exponential backoff retries automatically reattempt recoverable network errors up to three times.

---

## Implementation Notes

- Placeholder components returning `null` are safe to remove if unused, but keeping them lets you wire new tooling without refactoring call sites.
- `WardrobePanel` and `WardrobeModal` share wardrobe logic; prefer the panel for persistent sidebars and the modal for temporary overlays.
- Service functions return data URLs; convert to `Blob` or object URLs if you need downloadable assets.
- `Compare` and `SparklesCore` are client-side only (`"use client"`), so avoid importing them in SSR-only bundles.

