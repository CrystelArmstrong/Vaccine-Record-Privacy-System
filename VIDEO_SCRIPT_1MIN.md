# One-Minute Demo Video Script
## Vaccine Record Privacy System - Zama FHEVM Bounty December 2025

**Total Duration**: 60 seconds
**Format**: Screen recording with narration
**Required**: For competition submission

---

## Timeline & Actions

### 0:00-0:10 (10 seconds) - Introduction
**Screen**: README.md top section or project logo
**Action**:
- Show project title
- Quick pan across README features section

**Narration**: See NARRATION_SCRIPT.md

---

### 0:10-0:20 (10 seconds) - Smart Contract Highlights
**Screen**: contracts/VaccineRecordPrivacy.sol
**Action**:
- Scroll to line 12-16 (VaccineRecord struct with encrypted types)
- Highlight euint32, euint8
- Scroll to line 95-99 (FHE.asEuint32/asEuint8 conversion)
- Highlight lines 113-130 (FHE.allowThis and FHE.allow)

**Narration**: See NARRATION_SCRIPT.md

---

### 0:20-0:35 (15 seconds) - Test Suite Demonstration
**Screen**: Terminal showing test execution
**Action**:
- Execute: `npm test`
- Show test output scrolling
- Highlight "100+ passing tests"
- Show green checkmarks

**Narration**: See NARRATION_SCRIPT.md

---

### 0:35-0:45 (10 seconds) - Automation Tools
**Screen**: Split screen or quick cuts
**Action**:
- Show scripts/ folder with 3 files
- Quick execute: `npm run generate-docs`
- Show docs/ folder appearing with generated files
- Flash to package.json scripts section

**Narration**: See NARRATION_SCRIPT.md

---

### 0:45-0:55 (10 seconds) - Key Features Summary
**Screen**: README.md features section or create summary slide
**Action**:
- Show bullet points appearing one by one:
  * ✅ FHE Encryption (euint32, euint8)
  * ✅ Access Control (FHE.allow, FHE.allowThis)
  * ✅ Time-Based Permissions
  * ✅ 100+ Test Cases
  * ✅ Auto-Documentation
  * ✅ Production Ready

**Narration**: See NARRATION_SCRIPT.md

---

### 0:55-1:00 (5 seconds) - Closing
**Screen**: README.md bottom with submission info
**Action**:
- Show "Zama FHEVM Bounty December 2025" text
- Show GitHub repo link (if public)
- Fade to black with "Thank You"

**Narration**: See NARRATION_SCRIPT.md

---

## Technical Settings

**Recording Settings**:
- Resolution: 1920x1080 (1080p minimum)
- Frame rate: 30fps or 60fps
- Audio: Clear, 44.1kHz or 48kHz

**Terminal Settings**:
- Font size: 16-18pt
- Theme: High contrast (dark background recommended)
- Clear visible cursor

**Code Editor Settings**:
- Font size: 14-16pt
- Theme: High contrast
- Line numbers visible
- Syntax highlighting enabled

## Preparation Checklist

Before recording:
- [ ] All tests pass
- [ ] Contracts compiled
- [ ] Documentation generated
- [ ] Terminal history cleared
- [ ] Font sizes increased
- [ ] Notifications disabled
- [ ] Backup recording ready

## Recording Tips

1. **Practice First**: Do a dry run without recording
2. **Steady Pace**: Speak clearly, not too fast
3. **Visual Focus**: Keep important elements centered
4. **Smooth Transitions**: Use smooth scrolling, not jumping
5. **Professional**: No errors, no debugging on screen

## Post-Production

**Optional Edits**:
- Add title card at start (2 seconds)
- Add text overlays for key concepts
- Speed up slow sections (like npm install)
- Add background music (low volume, non-distracting)
- Color grade for consistency

**Required**:
- Export as MP4
- Upload to YouTube (unlisted or public)
- Add to SUBMISSION.md

## Alternative Format (If 1 minute is too short)

If you need more time, extend to **2 minutes** by:
- Adding 15 seconds for deployment demo (0:35-0:50)
- Adding 15 seconds for contract deployment verification
- Adding 15 seconds for more detailed FHEVM concept explanation
- Adding 15 seconds for access control demonstration

But try to keep it concise and under 2 minutes for maximum impact!
