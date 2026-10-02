#!/usr/bin/env bash
# Runs `auth generate` against a drizzle schema that only has the core tables,
# once per plugin set. Exits 1 if any variant crashes.
cd "$(dirname "$0")"
status=0
for v in oauth mcp oauth-resources; do
	out=$(VARIANT=$v npx auth generate --config auth.ts --output "out-$v.ts" -y 2>&1)
	if [ $? -eq 0 ] && [ -f "out-$v.ts" ]; then
		echo "PASS  $v: schema generated"
	else
		echo "FAIL  $v: $(echo "$out" | grep -m1 -o 'BetterAuthError.*')"
		status=1
	fi
	rm -f "out-$v.ts"
done
exit $status
