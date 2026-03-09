# Upload Troubleshooting Guide

## Verification Steps

### 1. Check Browser Console (F12 → Console)
You should see logs like:
```
Extracting topics...
Extracted topics: { "Logic": { questions: 3, marks: 5 }, ... }
Adding paper: { id: "...", title: "...", topics: {...}, ... }
Papers updated: [{ id: "...", ... }]
```

### 2. Upload Process Flow

```
User selects .txt file
    ↓
onChange triggered
    ↓
handleFileUpload() called
    ↓
FileReader.readAsText()
    ↓
extractTopics(text) executed
    ↓
New Paper created with extracted topics
    ↓
setPapers() updates state
    ↓
UI re-renders with new paper in list
```

### 3. Common Issues & Fixes

**Issue: Upload button doesn't respond**
- Solution: Check browser console for errors (F12)
- Verify file is .txt format
- Ensure title and subject are filled

**Issue: "Papers" list shows 0 papers**
- Check console logs to see if paper was added
- Try uploading again with console open
- Look for error messages

**Issue: "Topics showing as empty or wrong"**
- The extraction should find topics automatically
- If no topics found, defaults to "General"
- Check console for extraction errors

### 4. Expected Behavior

**For Discrete Mathematics exam:**
- Should show topics like: Logic, Set Theory, Relations, Functions, etc.
- Each topic shows: number of questions + total marks
- Multiple papers enable trend analysis

**Example output:**
```
Logic: 3 questions, 5 marks
Set Theory: 2 questions, 4 marks
Relations: 3 questions, 7 marks
...
```

### 5. Test File

Use: `testing_files/Discrete Mathematics_2k25.txt`

Fill form:
- Title: "Discrete Mathematics Final"
- Subject: "Discrete Mathematics"
- Year: 2025
- Teacher: (leave empty or fill)
- Exam Type: "Final"

Then upload the test file.

### 6. File Format Requirements

- **.txt files only** (no PDF, Word, etc.)
- Should contain numbered questions: `1. Question...`, `2. Question...`
- Optional: Markdown sections with `## Section A – Title (Marks)`
- System handles both formats automatically

### 7. Debug Console Log Output

If upload fails, you'll see:
```
Error uploading file: [specific error message]
```

### 8. Reset and Retry

If stuck:
1. Refresh browser (F5)
2. Fill form again
3. Select .txt file
4. Open console (F12)
5. Click upload and watch logs

## Still Having Issues?

Check:
- ✅ File is .txt format
- ✅ Form fields are filled (Title, Subject required)
- ✅ File has numbered questions (1., 2., 3., etc.)
- ✅ Browser console shows no errors (F12)
- ✅ File isn't too large (< 10MB)

The system now:
- ✅ Handles markdown sections (`##`)
- ✅ Handles plain text without headers
- ✅ Logs all steps to console
- ✅ Shows errors in alert boxes
- ✅ Defaults gracefully if no sections found
