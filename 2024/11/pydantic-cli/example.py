import sys
from pydantic.dataclasses import dataclass
from pydantic_settings import CliApp


@dataclass
class Settings:
    name: str
    age: int

    def cli_cmd(self) -> None:
        print(f"Hello {self.name} you are {self.age} years old")


if __name__ == "__main__":
    CliApp.run(Settings, sys.argv[1:])
