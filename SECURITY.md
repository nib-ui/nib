# Security policy

## Supported versions

Security fixes go into the latest minor release of every `@nib-ui/*` package. Older minors and
prereleases (`alpha`, `beta`, `rc`) are not patched: upgrade to the latest minor to get a fix.

| Version | Supported |
|---|---|
| Latest minor | Yes |
| Anything older | No |

## Reporting a vulnerability

Report it privately through GitHub: open the repository's **Security** tab and choose
**Report a vulnerability** (private vulnerability reporting). Please do not open a public issue,
discussion or pull request for it.

Include what you can:

- the affected package and version;
- what an attacker can do, and under which conditions;
- steps or a minimal page that reproduces it.

You get an acknowledgement within a week. Once a fix is ready we publish patched releases (built
in GitHub Actions with npm provenance) and a GitHub security advisory that credits you, unless
you ask not to be named.

## Scope

Nib's packages ship CSS and client-side JavaScript with no runtime dependencies. Reports that
matter most: script injection through component markup or attributes, ways around a strict
Content Security Policy, and anything in the published package contents or the release pipeline.
