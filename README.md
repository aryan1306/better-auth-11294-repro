# Repro: better-auth/better-auth#11294

`auth generate` crashes with `The model "oauthResource" was not found in the schema object` when the drizzle schema passed to the adapter doesn't have the OAuth tables yet and the config has any OAuth resource. `mcp()` always adds one, which is why the reporter only saw it with MCP. `oauthProvider({ resources: [...] })` fails the same way.

## Versions

- better-auth, auth (CLI), @better-auth/mcp, @better-auth/oauth-provider, @better-auth/drizzle-adapter @1.7.5 (reported), also tested on 1.7.7
- drizzle-orm@0.45.3, better-sqlite3 (in-memory), Node 22.19.0

## Run

    npm install
    npm test

`auth-schema-core.ts` is the schema `auth generate` produced for the core tables only, i.e. the state of a project before adding the plugin. `run.sh` runs `auth generate` once per plugin set (`VARIANT` in `auth.ts`).

## Result

| Version | `oauthProvider()` | `mcp({ resource })` | `oauthProvider({ resources })` |
| --- | --- | --- | --- |
| 1.7.5 | schema generated | fails | fails |
| 1.7.7 | schema generated | fails | fails |

Failure output:

    BetterAuthError: [# Drizzle Adapter]: The model "oauthResource" was not found in the schema object. Please pass the schema directly to the adapter options.

Expected: all three generate a schema that includes the OAuth tables.

## Notes

`mcp()` spreads `oauthProvider()`, so it already ships the `oauthResource` table. The crash comes from plugin `init`: with a non-empty `resources` list it calls `seedResources`
([oauth.ts#L526](https://github.com/better-auth/better-auth/blob/72a6394e30ced6654ebffe3c5b74dc1b570f6880/packages/oauth-provider/src/oauth.ts#L526)),
which tolerates a missing table only when the error matches `MISSING_TABLE_PATTERN`
([resources.ts#L814-L815](https://github.com/better-auth/better-auth/blob/72a6394e30ced6654ebffe3c5b74dc1b570f6880/packages/oauth-provider/src/resources.ts#L814-L815)).
The drizzle adapter's "not found in the schema object" error doesn't match, so `init` throws and the CLI never reaches schema generation.

Adding `was not found in the schema object` to that pattern in the installed dist makes all three variants pass on 1.7.7.

The reporter's second error (`defineRelationsPart is not a function`) is not covered here.
