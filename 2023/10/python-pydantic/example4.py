from pydantic.dataclasses import dataclass
from pydantic import field_validator, ValidationError

@dataclass
class Key3:
  key4: str
  key5: str

@dataclass
class Example:
  key1: str
  key2: int
  key3: Key3 | dict
  
  @field_validator("key3")
  @classmethod
  def validate_key3(cls, v: dict) -> Key3 | dict:
    try:
      k = Key3(**v)
    except ValidationError:
      return v
    
    return k
    

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
  
  if isinstance(example.key3, Key3):
    print(example.key3.key4)
    print(example.key3.key5)
