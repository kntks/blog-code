from pydantic_settings import BaseSettings, CliExplicitFlag, CliImplicitFlag


class ExplicitSettings(BaseSettings, cli_parse_args=True):
    """Boolean fields are explicit by default."""

    explicit_req: bool
    """
    --explicit_req bool   (required)
    """

    explicit_opt: bool = False
    """
    --explicit_opt bool   (default: False)
    """

    # Booleans are explicit by default, so must override implicit flags with annotation
    implicit_req: CliImplicitFlag[bool]
    """
    --implicit_req, --no-implicit_req (required)
    """

    implicit_opt: CliImplicitFlag[bool] = False
    """
    --implicit_opt, --no-implicit_opt (default: False)
    """


class ImplicitSettings(BaseSettings, cli_parse_args=True, cli_implicit_flags=True):
    """With cli_implicit_flags=True, boolean fields are implicit by default."""

    # Booleans are implicit by default, so must override explicit flags with annotation
    explicit_req: CliExplicitFlag[bool]
    """
    --explicit_req bool   (required)
    """

    explicit_opt: CliExplicitFlag[bool] = False
    """
    --explicit_opt bool   (default: False)
    """

    implicit_req: bool
    """
    --implicit_req, --no-implicit_req (required)
    """

    implicit_opt: bool = False
    """
    --implicit_opt, --no-implicit_opt (default: False)
    """
