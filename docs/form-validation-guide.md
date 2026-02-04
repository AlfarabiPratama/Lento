# Form Validation Implementation Guide

## Overview

Comprehensive form validation system using Zod schema validation with accessible error handling and real-time feedback.

## Features

✅ **Real-time validation** - Validates fields as users type (after first touch/submit)  
✅ **Schema-based validation** - Using Zod for type-safe validation schemas  
✅ **Accessible error messages** - ARIA live regions for screen readers  
✅ **Consistent UX** - FormField wrapper with integrated error states  
✅ **Touch tracking** - Only shows errors after user interacts with field  
✅ **Submit validation** - Full form validation on submit with focus on first error  
✅ **Loading states** - Disabled buttons during submission  

## Core Components

### 1. `useFormValidation` Hook

Location: `src/hooks/useFormValidation.js`

Reusable form validation hook with comprehensive state management.

**Usage:**
```javascript
import { useFormValidation } from '../hooks/useFormValidation'
import { habitSchema } from '../lib/validationSchemas'

const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    isSubmitting,
    isValid,
} = useFormValidation({
    initialValues: { name: '', email: '' },
    validationSchema: habitSchema,
    onSubmit: async (values) => {
        await api.create(values)
    }
})
```

**Features:**
- Real-time validation (after touch or submit)
- Touched field tracking
- Error state management
- Submit handling with error focus
- Programmatic field updates
- Form reset

### 2. `FormField` Component

Location: `src/components/ui/FormField.jsx`

Accessible form field wrapper with integrated error states.

**Usage:**
```jsx
<FormField
    label="Email"
    hint="We'll never share your email"
    error={errors.email}
    touched={touched.email}
    required
    fieldId="user-email"
>
    <input
        type="email"
        name="email"
        id="user-email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        className="input"
    />
</FormField>
```

**Props:**
- `label` - Field label text
- `hint` - Helper text below label
- `error` - Error message from validation
- `touched` - Whether field has been touched
- `required` - Shows asterisk and "required" indicator
- `fieldId` - Input ID for label association
- `children` - Input/textarea/select element

### 3. `ErrorMessage` Component

Location: `src/components/ui/ErrorMessage.jsx`

Accessible error message with ARIA live region.

**Usage:**
```jsx
<ErrorMessage id="email-error" error={errors.email} />
```

**Features:**
- ARIA live="polite" for screen reader announcements
- Icon support (IconAlertCircle)
- Conditional rendering (only when error exists)
- Consistent styling

## Validation Schemas

Location: `src/lib/validationSchemas.js`

### Available Schemas

#### `habitSchema`
```javascript
{
    name: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    reminder_enabled: z.boolean().optional(),
    reminder_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable(),
    reminder_days: z.array(z.number().min(0).max(6)).nullable()
}
```

#### `journalSchema`
```javascript
{
    content: z.string().min(10).max(10000),
    mood: z.enum(['great', 'good', 'okay', 'bad', 'awful']).nullable(),
    type: z.enum(['quick', 'daily', 'gratitude', 'reflection'])
}
```

#### `billSchema`
```javascript
{
    name: z.string().min(3).max(100),
    amount: z.number().positive().max(999999999),
    dueDate: z.string().min(1),
    category: z.string().min(1),
    recurring: z.boolean().optional(),
    recurringInterval: z.enum(['weekly', 'monthly', 'yearly']).optional(),
    notes: z.string().max(500).optional()
}
```

#### `transactionSchema`
```javascript
{
    amount: z.number().positive().max(999999999),
    description: z.string().min(1).max(200),
    category: z.string().min(1),
    date: z.string().min(1),
    notes: z.string().max(500).optional()
}
```

#### `notebookSchema`
```javascript
{
    title: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    emoji: z.string().emoji().optional()
}
```

### Adding New Schemas

```javascript
export const mySchema = z.object({
    fieldName: z.string()
        .min(3, 'Custom error message')
        .max(100, 'Too long'),
    
    optionalField: z.string()
        .max(500)
        .optional(),
    
    numberField: z.number({
        required_error: 'Required',
        invalid_type_error: 'Must be a number'
    }).positive().max(1000),
    
    enumField: z.enum(['option1', 'option2', 'option3'])
})
```

## Implementation Examples

### Habits Form

Location: `src/pages/Habits.jsx`

**Before:**
```jsx
const [habitForm, setHabitForm] = useState({ name: '', description: '' })

const handleCreate = async (e) => {
    e.preventDefault()
    if (!habitForm.name.trim()) return
    await create(habitForm)
}
```

**After:**
```jsx
const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    isSubmitting,
} = useFormValidation({
    initialValues: { name: '', description: '' },
    validationSchema: habitSchema,
    onSubmit: async (values) => {
        await create(values)
        resetForm()
    }
})
```

### Journal Form

Location: `src/pages/Journal.jsx`

**Key Changes:**
- Replaced `useState` for `content` and `mood` with `useFormValidation`
- Added `FormField` wrapper for textarea
- Real-time validation with 10-character minimum
- Accessible error messages

### Finance Bills Form

Location: `src/components/finance/organisms/AddBillForm.jsx`

**Key Changes:**
- Wrapped all inputs with `FormField`
- Added validation for amount (positive number)
- Date validation with minimum (today)
- Consistent error states across all fields

## CSS Styling

Location: `src/index.css`

```css
/* Form field error state */
.form-field-error input,
.form-field-error textarea,
.form-field-error select {
    @apply border-red-500 dark:border-red-400 
           focus:ring-red-200 dark:focus:ring-red-900 
           focus:border-red-500 dark:focus:border-red-400;
}
```

This applies red border and focus ring to inputs with errors.

## Accessibility Features

### ARIA Attributes

1. **`aria-invalid`** - Indicates field with error
   ```jsx
   <input aria-invalid={touched.email && errors.email ? 'true' : 'false'} />
   ```

2. **`aria-describedby`** - Links error message to input
   ```jsx
   <input aria-describedby="email-error email-hint" />
   <ErrorMessage id="email-error" error={errors.email} />
   ```

3. **`aria-live="polite"`** - Announces errors to screen readers
   ```jsx
   <div role="alert" aria-live="polite">
       {error}
   </div>
   ```

### Keyboard Navigation

- Automatic focus on first error field on submit
- Tab navigation works naturally
- Enter submits form from any field

### Screen Reader Support

- Field labels properly associated with inputs
- Required/optional indicators announced
- Error messages announced dynamically
- Hint text accessible

## Testing Checklist

### Manual Testing

- [ ] Enter valid data → No errors shown
- [ ] Enter invalid data → Error appears after blur
- [ ] Submit with errors → Focus moves to first error
- [ ] Fix error → Error message disappears
- [ ] Submit valid form → Success, form resets
- [ ] Loading state → Buttons disabled

### Accessibility Testing

- [ ] Tab through form - all fields reachable
- [ ] Screen reader announces labels
- [ ] Screen reader announces errors
- [ ] Screen reader announces required/optional
- [ ] Error color contrast meets WCAG AA
- [ ] Touch targets ≥ 44x44px

### Validation Testing

**Habits Form:**
- [ ] Name < 3 chars → Error
- [ ] Name empty → Error
- [ ] Description > 500 chars → Error
- [ ] Invalid time format → Error

**Journal Form:**
- [ ] Content < 10 chars → Error
- [ ] Content > 10,000 chars → Error
- [ ] Valid entry → Success

**Bills Form:**
- [ ] Amount ≤ 0 → Error
- [ ] Amount not a number → Error
- [ ] Name < 3 chars → Error
- [ ] Due date in past → Error
- [ ] Valid bill → Success

## Migration Guide

### Converting Existing Forms

1. **Install dependencies** (if not already)
   ```bash
   npm install zod
   ```

2. **Create validation schema** in `src/lib/validationSchemas.js`
   ```javascript
   export const myFormSchema = z.object({
       fieldName: z.string().min(1, 'Required')
   })
   ```

3. **Replace `useState` with `useFormValidation`**
   ```javascript
   // Before
   const [formData, setFormData] = useState({ name: '' })
   
   // After
   const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
       useFormValidation({
           initialValues: { name: '' },
           validationSchema: myFormSchema,
           onSubmit: async (values) => { /* handle submit */ }
       })
   ```

4. **Wrap inputs with `FormField`**
   ```jsx
   <FormField
       label="Name"
       error={errors.name}
       touched={touched.name}
       required
       fieldId="name"
   >
       <input
           name="name"
           id="name"
           value={values.name}
           onChange={handleChange}
           onBlur={handleBlur}
           className="input"
       />
   </FormField>
   ```

5. **Update submit handler**
   ```jsx
   // Before
   <form onSubmit={handleCreate}>
   
   // After
   <form onSubmit={handleSubmit}>
   ```

6. **Add loading state to buttons**
   ```jsx
   <button type="submit" disabled={isSubmitting}>
       {isSubmitting ? 'Saving...' : 'Save'}
   </button>
   ```

## Best Practices

### Validation Messages

✅ **DO:**
- "Nama minimal 3 karakter" (specific)
- "Email tidak valid" (clear)
- "Jumlah harus lebih dari 0" (actionable)

❌ **DON'T:**
- "Invalid input" (vague)
- "Error" (not helpful)
- "Required" (state the field name)

### Error Timing

- **On Change**: Validate after field is touched or form submitted
- **On Blur**: Always validate when leaving field
- **On Submit**: Validate entire form, focus first error

### Performance

- Validation is lightweight (Zod is fast)
- Only validates touched fields during onChange
- Full validation only on submit

### User Experience

- Show errors **after** user interacts (not immediately)
- Clear errors **as soon as** user fixes them
- Focus first error field on submit
- Disable submit button during submission
- Show loading state on buttons

## Troubleshooting

### Errors not showing

**Check:**
1. Is field touched? Errors only show after blur
2. Is `touched` passed to FormField?
3. Is `error` passed to FormField?
4. Has form been submitted? (Shows all errors)

### Validation not working

**Check:**
1. Is `validationSchema` passed to `useFormValidation`?
2. Is field name in schema matching input name?
3. Check console for Zod errors

### Form not submitting

**Check:**
1. Are there validation errors?
2. Is `onSubmit` async?
3. Check browser console for errors
4. Is form wrapped in `<form onSubmit={handleSubmit}>`?

## Future Enhancements

- [ ] Async validation (check username availability)
- [ ] Custom validation rules
- [ ] Multi-step form validation
- [ ] File upload validation
- [ ] Password strength indicator
- [ ] Conditional validation (field depends on another)

---

**Version:** 1.0.0  
**Last Updated:** January 23, 2026  
**Status:** ✅ Production Ready

**Forms with Validation:**
- ✅ Habits (Create/Edit)
- ✅ Journal (Quick Entry)
- ✅ Finance (Bills)
- ⏳ Settings (Pending)
- ⏳ Space Notebooks (Pending)
- ⏳ Goals (Pending)
