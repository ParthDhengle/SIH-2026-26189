import json
from pprint import pprint

from src.services.data_ingestion.get_data import get_data


ENTITY_ID = "b32a4fef-2213-5068-9e80-7cab000241a6"


result = get_data(ENTITY_ID)

print("\n===== GET DATA RESULT =====\n")
pprint(result, sort_dicts=False)


# Also save JSON so we can inspect/use it easily
with open("get_data_output.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, default=str)

print("\nSaved to: get_data_output.json")