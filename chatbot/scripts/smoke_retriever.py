import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.retriever import Retriever

r = Retriever(kb_dir="kb")

queries = [
    "What is the pricing plan?",
    "Is GST included?",
    "What is the refund policy?",
    "What modules are available?",
    "Explain the roadmap generator module",
    "What is HR tech maturity assessment?",
    "billing refund gst",
    "Who is the founder of Apple?"  # irrelevant
]

for q in queries:
    print("=" * 80)
    print("Q:", q)
    chunks = r.retrieve(q, top_k=3)
    if not chunks:
        print("→ NO MATCH (SAFE)")
        continue
    for c in chunks:
        print(f"- [{c.kb_name}] {c.entry['id']} | {c.entry['title']} | score={c.score:.3f}")
