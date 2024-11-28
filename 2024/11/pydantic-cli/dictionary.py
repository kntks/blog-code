from pydantic_settings import CliApp, BaseSettings


class Settings(BaseSettings):
    my_dict: dict[str, int]

    def cli_cmd(self) -> None:
        print(f"Dict: {self.my_dict}")


if __name__ == "__main__":
    CliApp.run(Settings)
