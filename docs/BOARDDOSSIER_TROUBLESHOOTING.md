# BoardDossierRenderer - Troubleshooting Guide

## Issue: "Advanced Analysis in Progress" Message

### What This Means
The `BoardDossierRenderer` component displays this message when it doesn't receive the AI-generated `consulting_report` data structure. This is the comprehensive board-level strategic briefing that contains all 17 sections of detailed analysis.

### Root Cause
The AI analysis hasn't completed or the `consulting_report` object is missing from the data being passed to the component.

## Data Flow Architecture

```
User Completes Assessment
         ↓
Assessment Submitted to Backend
         ↓
AI Processing (DeepSeek/Claude)
         ↓
AI Generates consulting_report JSON
         ↓
Data Stored in Database
         ↓
Report Route Fetches Data
         ↓
BoardDossierRenderer Receives Data
         ↓
Renders 17-Section Report
```

## Expected Data Structure

The `BoardDossierRenderer` expects data in this format:

```typescript
{
  // Option 1: Direct consulting_report
  consulting_report: {
    executive_summary: { ... },
    strategic_drivers: { ... },
    capability_assessment: { ... },
    // ... all other sections
  }
}

// OR Option 2: Nested under result
{
  result: {
    consulting_report: {
      executive_summary: { ... },
      strategic_drivers: { ... },
      // ... all other sections
    }
  }
}
```

## Required consulting_report Sections

The AI must generate these sections (defined in `app/utils/prompt.ts`):

1. **executive_summary**
   - metrics: Array of current/target/improvement metrics
   - key_insight: Strategic insight string

2. **strategic_drivers**
   - drivers: Array of transformation drivers with weights
   - alignment: Organization vs industry alignment
   - transformation_ambition: L1-L4 transformation levels

3. **capability_assessment**
   - digitization_heatmap: Process digitization status
   - bottlenecks: Critical issues
   - risk_assessment: Capability gaps

4. **priority_portfolio**
   - initiatives: Prioritized transformation initiatives
   - recommended_sequence: Implementation order

5. **change_readiness**
   - readiness_thermometer: Overall readiness score
   - resistance_profile: Change resistance factors
   - governance_support: Governance maturity

6. **architecture_assessment**
   - enabler_adoption: Technology enabler status
   - recommended_architecture: Architecture blueprint
   - integration_priority: Integration roadmap

7. **governance_metrics**
   - kpi_maturity: KPI measurement maturity
   - measurement_framework: Metrics framework
   - governance_structure: Governance model

8. **budget_timeline**
   - balanced_scenario: Investment/ROI/payback
   - investment_breakdown: Budget allocation
   - transformation_phases: Phased roadmap
   - milestones: Key milestones

9. **transformation_roadmap**
   - phases: Foundational/Tactical/Strategic/Innovative
   - dependencies_critical_path: Critical dependencies

10. **scenario_risk_management**
    - optimistic_scenario: Best case
    - pessimistic_scenario: Worst case
    - sensitivity_factors: Risk factors

11. **recommendations_next_steps**
    - immediate_actions: First 30 days
    - critical_success_factors: Success enablers
    - risk_mitigation_strategy: Risk management

## How to Fix

### Option 1: Verify AI Processing

Check if the AI is actually generating the consulting_report:

```typescript
// In your route handler (e.g., reports.tsx)
const data = await fetchAssessmentData(id);
console.log('Data structure:', JSON.stringify(data, null, 2));
console.log('Has consulting_report:', !!data?.consulting_report);
console.log('Has result.consulting_report:', !!data?.result?.consulting_report);
```

### Option 2: Check Database Storage

Verify the consulting_report is being saved:

```typescript
// After AI generation
const aiResponse = await generateAnalysis(prompt);
const parsed = JSON.parse(aiResponse);

console.log('AI Response has consulting_report:', 
  !!parsed.visualization_data?.consulting_report);

// Save to database
await saveAssessmentResult({
  ...parsed,
  // Ensure consulting_report is at the right level
});
```

### Option 3: Force AI Regeneration

If the report was generated before the new sections were added, regenerate it:

1. Navigate to the assessment in the admin panel
2. Click "Regenerate Analysis" or similar button
3. Wait for AI processing to complete
4. Refresh the report view

### Option 4: Add Fallback Content

For testing, you can add fallback content to the BoardDossierRenderer:

```typescript
export default function BoardDossierRenderer({ report, engineName }: BoardDossierRendererProps) {
    // Check for consulting_report
    let doc = report?.consulting_report || report?.consultingReport;
    
    // TEMPORARY: Add fallback for testing
    if (!doc && process.env.NODE_ENV === 'development') {
        console.warn('No consulting_report found, using fallback');
        doc = {
            executive_summary: {
                metrics: [
                    { metric: "HR Digital Maturity", current: "Level 2", target: "Level 4", improvement: "+2 Levels" },
                    { metric: "Process Automation", current: "25%", target: "70%", improvement: "+45%" },
                ],
                key_insight: "Organization shows strong strategic intent but requires foundational technology investments."
            },
            // ... add other sections as needed
        };
    }
    
    if (!doc) {
        return (/* loading message */);
    }
    
    // ... rest of component
}
```

## Debugging Checklist

- [ ] Verify assessment was submitted successfully
- [ ] Check AI processing completed (no errors in logs)
- [ ] Confirm consulting_report exists in database
- [ ] Validate data structure matches expected format
- [ ] Ensure report prop is being passed correctly
- [ ] Check for JavaScript errors in browser console
- [ ] Verify AI prompt includes consulting_report structure
- [ ] Confirm AI response is valid JSON
- [ ] Check database query returns full data
- [ ] Validate route loader passes data correctly

## Common Issues

### Issue 1: AI Timeout
**Symptom**: Analysis never completes
**Solution**: Increase AI timeout, check API limits

### Issue 2: Invalid JSON
**Symptom**: Parsing errors in console
**Solution**: Add JSON validation, improve AI prompt

### Issue 3: Missing Sections
**Symptom**: Some sections show "undefined"
**Solution**: Update AI prompt to include all required sections

### Issue 4: Data Not Saved
**Symptom**: Report shows loading on refresh
**Solution**: Verify database save operation completes

## Testing the Full Flow

```typescript
// 1. Complete an assessment
// 2. Submit and wait for AI processing
// 3. Check the data in browser DevTools:

// In the report page, open console and run:
const reportData = window.__REMIX_DATA__?.loaderData;
console.log('Report Data:', reportData);
console.log('Has consulting_report:', 
  !!reportData?.data?.consulting_report || 
  !!reportData?.data?.result?.consulting_report
);

// 4. If missing, check the API response:
fetch('/api/assessment/YOUR_ID')
  .then(r => r.json())
  .then(data => console.log('API Data:', data));
```

## Next Steps

1. **Identify where the data flow breaks** using the debugging checklist
2. **Check AI generation logs** for any errors or incomplete responses
3. **Verify database schema** supports all consulting_report fields
4. **Test with a fresh assessment** to ensure latest AI prompt is used
5. **Add error handling** to show specific error messages instead of generic loading

## Contact Points

- AI Prompt Definition: `app/utils/prompt.ts` (lines 98-153)
- Component Rendering: `app/components/reports/BoardDossierRenderer.tsx`
- Data Fetching: Check your report route loaders
- Database Schema: Verify DynamoDB/database structure
