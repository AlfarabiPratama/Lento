# Category Selection Logic - Test Analysis

## Current Implementation (TxnSheet.jsx lines 88-109)

```jsx
// Filter categories by type (deduplicated)
const filteredCategories = categories
    .filter(c => c.type === type)
    .filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i)
    .map(c => ({ value: c.id, label: c.name, icon: c.icon }))

// Reset & set default category when type changes
useEffect(() => {
    if (type === 'transfer') {
        setCategoryId('')
        return
    }

    if (filteredCategories.length > 0) {
        const lastCategoryId = localStorage.getItem(`lento_last_category_${type}`)
        const validCat = filteredCategories.find(c => c.value === lastCategoryId)
        setCategoryId(validCat ? validCat.value : filteredCategories[0].value)
    } else {
        setCategoryId('')
    }
}, [type, filteredCategories])
```

## Test Scenarios

### Scenario 1: Initial load - Expense (default)
**Expected:**
- Filter kategori dengan `type === 'expense'`
- Tampilkan: Makan & jajan, Transport, Kos/kontrakan, Pulsa & data, Kuliah, Nongkrong, Langganan, Kesehatan, Donasi, Lainnya
- Auto-select dari `localStorage.lento_last_category_expense` OR first category (Makan & jajan)

**Test:**
```
type = 'expense'
filteredCategories = [expense categories]
categoryId = localStorage OR 'makan-jajan-id'
```

✅ **PASS** - Filter by type working, deduplication working, localStorage fallback to first item

---

### Scenario 2: Switch Expense → Income
**Expected:**
- Filter kategori dengan `type === 'income'`
- Tampilkan: Uang saku, Beasiswa, Gaji/Freelance, Hadiah, Refund
- categoryId reset kemudian auto-select dari `localStorage.lento_last_category_income` OR first category (Uang saku)

**Test:**
```
type changes: 'expense' → 'income'
useEffect triggers
filteredCategories updates to [income categories]
categoryId = localStorage OR 'uang-saku-id'
```

✅ **PASS** - Type change triggers useEffect, categories filtered correctly, auto-select working

---

### Scenario 3: Switch Income → Transfer
**Expected:**
- categoryId should be cleared ('')
- No kategori displayed (transfer tidak punya kategori)

**Test:**
```
type changes: 'income' → 'transfer'
useEffect triggers
if (type === 'transfer') → setCategoryId('')
return early
```

✅ **PASS** - Transfer mode clears categoryId, early return prevents category selection

---

### Scenario 4: Switch Transfer → Expense
**Expected:**
- Filter kategori dengan `type === 'expense'`
- categoryId auto-select dari localStorage OR first category

**Test:**
```
type changes: 'transfer' → 'expense'
useEffect triggers
type !== 'transfer' → proceed to filter logic
filteredCategories = [expense categories]
categoryId = localStorage OR first item
```

✅ **PASS** - Switching from transfer back to expense/income works correctly

---

### Scenario 5: Edit mode - Load existing transaction
**Expected:**
- initialData has existing categoryId
- categoryId should preserve the existing value
- useEffect should NOT override initialData

**Test:**
```
initialData = { type: 'expense', category_id: 'transport-id', ... }
useEffect (open trigger) sets: setCategoryId(initialData.category_id)
useEffect (type change) does NOT trigger (type already set)
categoryId = 'transport-id' (preserved)
```

⚠️ **POTENTIAL ISSUE FOUND!**

**Problem:** 
Line 88-109 useEffect depends on `[type, filteredCategories]`. When editing:
1. `useEffect` on line 58 sets `setCategoryId(initialData.category_id)`
2. But then `filteredCategories` might change → triggers line 88 useEffect again
3. Could potentially override initialData categoryId with localStorage or first item

**Need to check:** Does initialData categoryId get preserved in edit mode?

---

## Fix Assessment

### What was fixed (commit 56543c6):
✅ Merged two conflicting useEffects into one
✅ Removed categoryId from dependency array (prevents infinite loop)
✅ Single source of truth for category state
✅ Transfer type properly handled with early return
✅ localStorage fallback logic works correctly

### What might still need attention:
⚠️ Edit mode: initialData categoryId preservation
- When opening TxnSheet in edit mode, does initialData.category_id get overridden by localStorage or first category?
- Need to add logic to detect edit mode and skip auto-selection

---

## Recommended Additional Fix

Add edit mode detection in category selection useEffect:

```jsx
useEffect(() => {
    if (type === 'transfer') {
        setCategoryId('')
        return
    }

    // Skip auto-selection if in edit mode and already have initialData categoryId
    if (mode === 'edit' && initialData.category_id && categoryId === initialData.category_id) {
        return
    }

    if (filteredCategories.length > 0) {
        const lastCategoryId = localStorage.getItem(`lento_last_category_${type}`)
        const validCat = filteredCategories.find(c => c.value === lastCategoryId)
        setCategoryId(validCat ? validCat.value : filteredCategories[0].value)
    } else {
        setCategoryId('')
    }
}, [type, filteredCategories])
```

---

## Conclusion

Current implementation (commit 56543c6):
- ✅ Fixed race condition between two useEffects
- ✅ Fixed infinite loop risk with categoryId dependency
- ✅ Transfer mode working correctly
- ✅ Category filtering by type working
- ✅ localStorage persistence working

Potential edge case:
- ⚠️ Edit mode might not preserve initialData.category_id if filteredCategories changes
- Need to test: Open edit sheet → category should stay as original, not change to localStorage or first item

Testing needed in production:
1. Create transaction with "Transport" category
2. Edit that transaction
3. Verify category still shows "Transport" and doesn't change to localStorage last category or "Makan & jajan"
