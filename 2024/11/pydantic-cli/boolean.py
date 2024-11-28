from pydantic_settings import (
    CliApp,
    BaseSettings,
    CliExplicitFlag,
    CliImplicitFlag,
    CliSubCommand,
)


class ExplicitSettings(BaseSettings):
    """Boolean fields are explicit by default."""

    explicit_req: bool
    """
    --explicit_req bool   (required)
    """

    # Booleans are explicit by default, so must override implicit flags with annotation
    implicit_req: CliImplicitFlag[bool]
    """
    --implicit_req, --no-implicit_req (required)
    """

    explicit_opt: bool = False
    """
    --explicit_opt bool   (default: False)
    """

    implicit_opt: CliImplicitFlag[bool] = False
    """
    --implicit_opt, --no-implicit_opt (default: False)
    """

    def cli_cmd(self) -> None:
        print(f"explicit_req: {self.explicit_req}")
        print(f"implicit_req: {self.implicit_req}")
        print(f"explicit_opt: {self.explicit_opt}")
        print(f"implicit_opt: {self.implicit_opt}")


class ImplicitSettings(BaseSettings, cli_implicit_flags=True):
    """With cli_implicit_flags=True, boolean fields are implicit by default."""

    # Booleans are implicit by default, so must override explicit flags with annotation
    explicit_req: CliExplicitFlag[bool]
    """
    --explicit_req bool   (required)
    """

    implicit_req: bool
    """
    --implicit_req, --no-implicit_req (required)
    """

    explicit_opt: CliExplicitFlag[bool] = False
    """
    --explicit_opt bool   (default: False)
    """

    implicit_opt: bool = False
    """
    --implicit_opt, --no-implicit_opt (default: False)
    """

    def cli_cmd(self) -> None:
        print(f"explicit_req: {self.explicit_req}")
        print(f"implicit_req: {self.implicit_req}")
        print(f"explicit_opt: {self.explicit_opt}")
        print(f"implicit_opt: {self.implicit_opt}")


class Settings(BaseSettings):
    explicit: CliSubCommand[ExplicitSettings]
    implicit: CliSubCommand[ImplicitSettings]

    def cli_cmd(self) -> None:
        CliApp.run_subcommand(self)


if __name__ == "__main__":
    CliApp.run(Settings)
