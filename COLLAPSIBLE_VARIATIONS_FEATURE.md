# Collapsible Variations Feature - UI Documentation

## Overview
The variation availability feature now includes a **collapsible dropdown** interface that keeps the food item cards clean while providing easy access to manage variation availability.

## UI Design

### Food Item Card with Collapsible Variations

#### Collapsed State (Default)
```
┌─────────────────────────────────────────────────────┐
│  [Food Item Image]                                  │
│                                                     │
│  Burger Deluxe                                      │
│  🔘 Available | Unavailable                         │
│                                                     │
│  [▶ 3 variations                      Manage]      │
│  ↑ Clickable dropdown button (blue background)     │
│                                                     │
│  Branch: Main Branch                                │
│  Category: Burgers                                  │
│                                                     │
│  [Edit]  [Delete]                                   │
└─────────────────────────────────────────────────────┘
```

#### Expanded State
```
┌─────────────────────────────────────────────────────┐
│  [Food Item Image]                                  │
│                                                     │
│  Burger Deluxe                                      │
│  🔘 Available | Unavailable                         │
│                                                     │
│  [▼ 3 variations                        Hide]      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Small • 200 Rs              [🟢 Toggle]     │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Medium • 350 Rs             [⚪ Toggle]     │   │ (grayed & strikethrough)
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Large • 500 Rs              [🟢 Toggle]     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Branch: Main Branch                                │
│  Category: Burgers                                  │
│                                                     │
│  [Edit]  [Delete]                                   │
└─────────────────────────────────────────────────────┘
```

## Component Details

### Dropdown Header Button
- **Background:** Blue (`bg-blue-50`)
- **Hover State:** Darker blue (`hover:bg-blue-100`)
- **Border:** Blue (`border-blue-200`)
- **Layout:** Full width with space-between
- **Left Content:** 
  - Chevron icon (rotates 90° when expanded)
  - Variation count (bold blue number)
  - "variation(s)" text
- **Right Content:** 
  - "Manage" when collapsed
  - "Hide" when expanded

### Variation Bars (When Expanded)
**Available Variation:**
- Background: Light green (`bg-green-50`)
- Border: Green (`border-green-200`)
- Text: Dark gray (`text-gray-700`)
- Toggle: Green (`bg-green-500`)

**Unavailable Variation:**
- Background: Light gray (`bg-gray-100`)
- Border: Gray (`border-gray-200`)
- Text: Gray with strikethrough (`text-gray-400 line-through`)
- Toggle: Gray (`bg-gray-400`)

### Layout Features
- **Consistent Width:** All variation bars have the same width
- **Grid Layout:** `grid-cols-1` ensures uniform appearance
- **Truncation:** Long variation names are truncated with ellipsis
- **Flex Alignment:** Name/price on left, toggle on right
- **Responsive:** Works on all screen sizes

## Interaction Behavior

### Expand/Collapse
1. **Click dropdown button** → Variations list appears/disappears
2. **Chevron animation** → Rotates 90° smoothly
3. **Button text changes** → "Manage" ↔ "Hide"
4. **State persists** → Each item's expanded state is independent

### Toggle Variation
1. **Click mini toggle** → Sends update request
2. **Pulsing animation** → Shows loading state
3. **Color changes** → Green ↔ Gray
4. **Text updates** → Normal ↔ Strikethrough
5. **Toast notification** → Confirms success/error

### Click Event Handling
- **Dropdown button:** `stopPropagation()` to prevent card click
- **Toggle button:** `stopPropagation()` to prevent dropdown toggle
- **Card background:** Can still click Edit/Delete normally

## Color Scheme

### Dropdown Button
- Default: `bg-blue-50` with `border-blue-200`
- Hover: `bg-blue-100`
- Text: `text-blue-600` and `text-blue-700`
- Icon: `text-blue-600`

### Variation Bars
- **Available:**
  - Background: `bg-green-50`
  - Border: `border-green-200`
  - Text: `text-gray-700`
  - Toggle: `bg-green-500`

- **Unavailable:**
  - Background: `bg-gray-100`
  - Border: `border-gray-200`
  - Text: `text-gray-400` with strikethrough
  - Toggle: `bg-gray-400`

## Benefits

### For Admins
1. **Clean Interface:** Cards are compact by default
2. **Quick Access:** One click to expand variations
3. **Easy Management:** All toggles visible when expanded
4. **Visual Clarity:** Clear color coding for status
5. **No Page Reload:** Instant updates

### For Organization
1. **Space Efficient:** Many items visible at once
2. **Scalable:** Works well with items having many variations
3. **Intuitive:** Familiar dropdown pattern
4. **Professional:** Clean, modern design

## Usage Flow

### Quick Toggle Workflow
```
1. View Food Items list
   ↓
2. Click dropdown button on item
   ↓
3. Variations list expands
   ↓
4. Click toggle on specific variation
   ↓
5. Variation updates instantly
   ↓
6. Continue managing or collapse
```

### Advantages Over Always-Visible Design
- ✅ **Cleaner cards** when variations aren't being managed
- ✅ **Faster scrolling** through many items
- ✅ **Focus on important info** (item name, image, main availability)
- ✅ **Expandable when needed** for management tasks
- ✅ **Better mobile experience** with less clutter

## Technical Implementation
- State management: `expandedVariations` object tracks each item
- Toggle function: `toggleVariationsExpanded(itemId)`
- Smooth transitions: CSS transitions for chevron rotation
- Event handling: `stopPropagation()` prevents unwanted clicks
- Accessibility: ARIA labels and keyboard support
