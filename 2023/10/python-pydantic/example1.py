from pydantic.dataclasses import dataclass

@dataclass
class Key3:
  key4: str
  key5: str

@dataclass
class Example:
  key1: str
  key2: int
  key3: Key3
  

def from_example_api():
  return {
    "key1": "a",
    "key2": "asdfasffadsgdgerg",
    "key3": {
      "key4": "c",
      "key5": "d"
    }
  }
  
if __name__ == "__main__":
  res = from_example_api()
  example = Example(**res)
  
  print(example.key1)
  print(example.key2)
  print(example.key3)
