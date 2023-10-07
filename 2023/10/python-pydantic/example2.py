from pydantic.dataclasses import dataclass
from pydantic import ConfigDict

config = ConfigDict(extra="forbid")

@dataclass
class Key3:
  key4: str
  key5: str

@dataclass(config=config)
class Example:
  key1: str
  key2: int
  key3: Key3
  

def from_example_api():
  return {
    "key1": "a",
    "key2": 1,
    "key3": {
      "key4": "c",
      "key5": "d"
    },
    "key6": "fasdfadf"
  }
  
if __name__ == "__main__":
  res = from_example_api()
  example = Example(**res)
  
  print(example)
