from __future__ import annotations

from typing import Any, Dict, List, Optional

from core.router import RouteModule

def refuse_missing_report(module: RouteModule, prompt_version: str) -> Dict[str, Any]:
    return{
        "answer": (
            "This is not present in the provided report.\n"
            "I can explain your Roadmap/Assessment only after the report JSON is available."
        ),
        "module": module.value,
        "prompt_version":prompt_version,
        "sources_used":[],
    }

def refuse_missing_kb(module: RouteModule, prompt_version: str) -> Dict[str, Any]:
    return {
        "answer": (
            "This is not present in the approved knowledge.\n\n"
            "I can only answer FAQs using approved KB chunks. Try rephrasing your question or ask about:\n"
            "- Pricing & plans (tiers, subscriptions)\n"
            "- GST, billing, refunds\n"
            "- Modules and what each one does"
        ),
        "module": module.value,
        "prompt_version": prompt_version,
        "sources_used": [],
    }

#returns a safe refusal responce in dict if grounding is missing, returns none if it's OKAY to proceed
def grounding_guard(
    module: RouteModule,
    *,
    report_json: Optional[Dict[str, Any]],
    kb_chunks: Optional[List[Any]],
    prompt_version: str,
) -> Optional[Dict[str, Any]]:
    
    #Report
    if module in{RouteModule.ROADMAP,RouteModule.ASSESSMENT}:
        if not report_json:
            return refuse_missing_report(module, prompt_version)
        
    #KB
    if module==RouteModule.FAQ:
        if not kb_chunks:
            refuse_missing_kb(module,prompt_version)

    return None