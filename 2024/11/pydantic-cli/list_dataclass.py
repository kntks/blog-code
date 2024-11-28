from pydantic import Field
from pydantic.dataclasses import dataclass
from pydantic_settings import CliApp


@dataclass
class Settings:
    my_list: list[str] = Field(validation_alias="mylist")

    def cli_cmd(self) -> None:
        print(f"List: {self.my_list}")


if __name__ == "__main__":
    CliApp.run(Settings)
