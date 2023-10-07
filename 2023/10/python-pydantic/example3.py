from pydantic.dataclasses import dataclass

@dataclass
class Key3:
  key4: str | None = None
  key5: str | None = None

@dataclass
class Example:
  key1: str
  key2: int
  key3: Key3
  

def from_example_api():
  return {
    "key1": "a",
    "key2": 1,
    "key3": {
    },
  }
  
if __name__ == "__main__":
  res = from_example_api()
  example = Example(**res)
  
  print(example)
  print(example.key3.key4)
  print(example.key3.key5)
