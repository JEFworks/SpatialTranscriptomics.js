import pronto
import requests
import json
from progress.bar import Bar

def main():
  go_basic = pronto.Ontology.from_obo_library("go/go-basic.obo")
  gene_sets = dict()

  bar = Bar('Processing', max=len(go_basic))

  for key in go_basic:
    term = go_basic[key]

    if type(term) == pronto.term.Term:
      req = requests.get("http://api.geneontology.org/api/bioentity/function/" + term.id + "/genes?facet=false&unselect_evidence=true&exclude_automatic_assertions=true&fetch_objects=false&use_compact_associations=false&relationship_type=involved_in")
      json_data = json.loads(req.text)
      curr_set = set()

      if "associations" not in json_data:
        continue

      for entry in json_data["associations"]:
        if entry["object"]["id"] == term.id:
          gene_name = entry["subject"]["label"]
          curr_set.add(gene_name.lower())

      if len(curr_set) >= 2:
        gene_sets[term.id + " " + term.name] = list(curr_set)

    bar.next()

  with open("gene_sets.json", "w") as outfile: 
    json.dump(gene_sets, outfile)
  
  bar.finish()
  
if __name__ == "__main__":
    main()
