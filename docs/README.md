# Rogatio documentation

Rogatio is an open-source platform for verified citizen petitions in Mexico.
Each signer proves their identity with the INE voter credential and gets a public, verifiable receipt.
At its threshold, Rogatio sends an Art. 8 petition to the competent authority and copies the signers' representatives.

- [Whitepaper](whitepaper.md): problem, design, trust model, privacy, roadmap and governance.
- [01 Jurisdictions](architecture/01-jurisdictions.md): territorial units of CDMX and the `jurisdictions` data model.
- [02 Routing](architecture/02-routing.md): how Rogatio selects the competent authority for each category.
- [03 Representatives](architecture/03-representatives.md): which representatives get a copy, and the `representatives` table.
- [04 Authentication](architecture/04-authentication.md): INE credential checks, one person one signature, privacy rules.

License: [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html). Site: [rogatio.org](https://rogatio.org).
