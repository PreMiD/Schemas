<div align="center">
    <img src="https://avatars3.githubusercontent.com/u/46326568?s=400&amp;u=15e4a4988014780288d30ffb969fd1569fec23e6&amp;v=4" width="128px" style="max-width:100%;">
    <h1>PreMiD Schemas</h1>
</div>

This repository contains the schemas used to validate various files over the PreMiD source code repositories.
If you have found a problem with a schema, please feel free to open a <a href="https://github.com/PreMiD/Schemas/pulls">pull request</a>.

<div align="left">
    <a href="https://discord.gg/WvfVZ8T" title="Join our Discord!" rel="nofollow">
    <img src="https://camo.githubusercontent.com/987903b512adb37c953df3e83f1921dc29140493/68747470733a2f2f646973636f72646170702e636f6d2f6170692f6775696c64732f3439333133303733303534393830353035372f7769646765742e706e673f7374796c653d62616e6e657232" height="76px" alt="Join our Discord!" data-canonical-src="https://discordapp.com/api/guilds/493130730549805057/widget.png?style=banner2" style="max-width:100%;">
    </a>
</div>

## Schema versioning
Schemas are versioned using `MAJOR.MINOR`. Patches are applied directly to the applicable version of the schema.
Minor is bumped when a new property is added and it can be extended from a previous version of the schema.
Major is bumped when properties are removed or the new iteration of the schema cannot be extended from the previous version.

## schemas.premid.app
All schemas are hosted under schemas.premid.app. To use a schema, use `https://schemas.premid.app/:schemaName/:version` as the URL.
`:schemaName` is the name of the thing you need the schema for (e.g. `metadata`) and `:version` is the version of the schema (e.g. `1.0`).

## Folder structure

```bash
schemas # where the schemas are stored
├── schemaName # the name of the schema
│   ├── version.json # the schema file itself, where the name is the version
│   └── README.md # simple README to document version changelogs and what the schema is for
server # schema server files
```