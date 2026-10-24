"""Packaging checks for the integration and its frontend asset."""

import ast
import json
from collections.abc import Mapping
from pathlib import Path
import re
import types
import unittest


ROOT = Path(__file__).parents[1]


class PackageTests(unittest.TestCase):
    def test_hacs_manifest_and_integration_domain_match(self):
        with (ROOT / "hacs.json").open(encoding="utf-8") as file:
            hacs = json.load(file)
        with (ROOT / "custom_components/climate_flow_scheduler/manifest.json").open(encoding="utf-8") as file:
            manifest = json.load(file)
        self.assertEqual(manifest["domain"], "climate_flow_scheduler")
        self.assertEqual(manifest["name"], "Climate Flow Scheduler")
        self.assertEqual(hacs["name"], "Climate Flow Scheduler")
        self.assertEqual(manifest["documentation"], "https://github.com/kerdx/climate-flow-card")
        self.assertEqual(hacs["homeassistant"], "2025.1.0")
        self.assertNotIn("category", hacs)
        # The exact version is owned by the changelog-consistency test; here
        # only the semantic-version shape is enforced.
        self.assertRegex(str(manifest["version"]), r"^\d+\.\d+\.\d+$")
        self.assertEqual(manifest["issue_tracker"], "https://github.com/kerdx/climate-flow-card/issues")
        self.assertTrue(manifest["config_flow"])
        self.assertTrue(manifest["single_config_entry"])
        integration_files = {
            path.name for path in (ROOT / "custom_components/climate_flow_scheduler").iterdir()
        }
        self.assertIn("services.yaml", integration_files)

    def test_hacs_brand_icon_is_a_png(self):
        icon = ROOT / "custom_components/climate_flow_scheduler/brand/icon.png"
        data = icon.read_bytes()
        self.assertTrue(data.startswith(b"\x89PNG\r\n\x1a\n"))
        self.assertEqual(int.from_bytes(data[16:20], "big"), 256)
        self.assertEqual(int.from_bytes(data[20:24], "big"), 256)

    def test_services_documentation_covers_registered_services(self):
        services = ROOT / "custom_components/climate_flow_scheduler/services.yaml"
        self.assertTrue(services.is_file())
        text = services.read_text(encoding="utf-8")
        for service in ("save_program", "set_enabled", "delete_program", "set_manual_override", "set_pause", "resume_program"):
            self.assertIn(f"{service}:", text)
        # The vacation pause fields are documented with their service schema.
        for field in ("temperature", "duration"):
            self.assertIn(field, text)
        for duration in ("1d", "3d", "7d", "14d", "30d"):
            self.assertIn(f'"{duration}"', text)

    def test_card_source_has_no_duplicate_copies(self):
        """Guard against reintroducing a second copy of the card source.

        The installed card ships one file (www/climate-flow-card.js).
        Development copies drift apart silently, so any duplicate file
        anywhere in the repository fails packaging.
        """
        served = ROOT / "custom_components/climate_flow_scheduler/www/climate-flow-card.js"
        self.assertTrue(served.is_file())
        copies = sorted(
            path for path in ROOT.rglob("climate-flow-card.js")
            if ".git" not in path.parts and "__pycache__" not in path.parts
        )
        self.assertEqual([served.relative_to(ROOT)], [path.relative_to(ROOT) for path in copies])

    def test_card_tests_import_the_shipped_source(self):
        """The JavaScript tests must read the shipped card, not a stray copy."""
        test_source = (ROOT / "climate-flow-card.test.js").read_text(encoding="utf-8").replace("\\", "/")
        served_relation = "custom_components/climate_flow_scheduler/www/climate-flow-card.js"
        self.assertIn(served_relation, test_source)
        self.assertNotIn("'./climate-flow-card.js'", test_source)
        self.assertNotIn('"./climate-flow-card.js"', test_source)

    def test_config_and_storage_versions_have_migration_support(self):
        const = (ROOT / "custom_components/climate_flow_scheduler/const.py").read_text(encoding="utf-8")
        flow = (ROOT / "custom_components/climate_flow_scheduler/config_flow.py").read_text(encoding="utf-8")
        integration = (ROOT / "custom_components/climate_flow_scheduler/__init__.py").read_text(encoding="utf-8")
        schedule = (ROOT / "custom_components/climate_flow_scheduler/schedule.py").read_text(encoding="utf-8")
        self.assertIn("STORE_VERSION = 1", const)
        self.assertIn("STORAGE_VERSION = 3", const)
        self.assertIn("Store(hass, STORE_VERSION, STORAGE_KEY)", integration)
        self.assertIn("CONFIG_ENTRY_VERSION = 1", const)
        self.assertIn("VERSION = CONFIG_ENTRY_VERSION", flow)
        # Home Assistant calls this hook only for entries with a version that
        # differs from the current one, so the wiring must already exist.
        self.assertIn("def async_migrate_entry", integration)
        self.assertIn("entry.version", integration)
        self.assertIn("version=CONFIG_ENTRY_VERSION", integration)
        self.assertNotIn("title=", integration)
        # Stored payloads must migrate or fail loudly, never silently vanish.
        self.assertIn("def migrate_storage_data", schedule)
        self.assertIn("migrate_storage_data(stored, stored_version, STORAGE_VERSION)", integration)
        # Every previous version needs a registered step up to the current one.
        self.assertIn("DATA_MIGRATIONS[1] = _migrate_v1_to_v2", schedule)
        self.assertIn("DATA_MIGRATIONS[2] = _migrate_v2_to_v3", schedule)
        # The vacation pause is persisted next to the overrides.
        self.assertIn('"pauses": self.pauses', integration)
        self.assertIn('"set_pause"', integration)

    def test_manifest_version_matches_changelog(self):
        """The manifest version must match the newest CHANGELOG section."""
        with (ROOT / "custom_components/climate_flow_scheduler/manifest.json").open(encoding="utf-8") as file:
            manifest = json.load(file)
        changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        headings = [line for line in changelog.splitlines() if line.startswith("## ")]
        match = re.fullmatch(r"## v([0-9]+\.[0-9]+\.[0-9]+)\s*", headings[0])
        self.assertIsNotNone(headings[0] and match, f"CHANGELOG must start with '## vX.Y.Z', found: {headings[0]!r}")
        self.assertEqual(manifest["version"], match.group(1))

    def test_manifest_keys_sorted_like_hassfest(self):
        """hassfest requires: domain, name, then the remaining keys sorted."""
        with (ROOT / "custom_components/climate_flow_scheduler/manifest.json").open(encoding="utf-8") as file:
            manifest = json.load(file)
        keys = list(manifest)
        self.assertEqual(keys[:2], ["domain", "name"])
        self.assertEqual(keys[2:], sorted(keys[2:]))

    def test_service_exceptions_are_translated_in_every_language(self):
        """Exceptions raised by the services carry keys both languages define."""
        # Every ScheduleValidationError code that can reach a service caller;
        # keep this list in sync with the raise sites in schedule.py/init.py.
        service_error_codes = {
            "invalid_program", "invalid_time", "invalid_temperature",
            "invalid_hvac_mode", "unsupported_hvac_mode", "entity_validation_failed",
            "no_program", "invalid_enabled", "invalid_slots", "too_many_slots",
            "empty_enabled_program", "invalid_away_temperature", "invalid_slot_schema",
            "invalid_slot_id", "duplicate_slot_id", "invalid_days", "duplicate_days",
            "same_start_end", "slots_overlap", "climate_range_unavailable",
            "climate_range_invalid", "target_outside_limits", "target_off_step",
            "heat_cool_unsupported",
            "invalid_override_duration", "no_next_change", "override_hvac_off", "invalid_override_step",
            "invalid_pause_duration", "pause_hvac_off",
        }
        exceptions = {}
        for language in ("en", "it"):
            translations = json.load(
                (ROOT / f"custom_components/climate_flow_scheduler/translations/{language}.json").open(encoding="utf-8")
            )
            exceptions[language] = translations.get("exceptions", {})
            self.assertTrue(
                service_error_codes <= set(exceptions[language]),
                f"exceptions section of {language}.json misses codes",
            )
        self.assertEqual(set(exceptions["en"]), set(exceptions["it"]))
        for language, messages in exceptions.items():
            for code, entry in messages.items():
                self.assertIn("message", entry, f"{language}.{code} has no message")

    def test_service_errors_carry_translation_metadata(self):
        """Raised validation errors keep English fallback plus translation keys."""
        integration = (ROOT / "custom_components/climate_flow_scheduler/__init__.py").read_text(encoding="utf-8")
        self.assertIn("self.translation_domain = DOMAIN", integration)
        self.assertIn("self.translation_key = self.code", integration)
        self.assertIn("self.translation_placeholders", integration)

    def test_frontend_is_registered_as_an_integration_resource(self):
        with (ROOT / "custom_components/climate_flow_scheduler/manifest.json").open(encoding="utf-8") as file:
            manifest = json.load(file)
        self.assertIn("frontend", manifest["dependencies"])

        const = (ROOT / "custom_components/climate_flow_scheduler/const.py").read_text(encoding="utf-8")
        integration = (ROOT / "custom_components/climate_flow_scheduler/__init__.py").read_text(encoding="utf-8")
        self.assertIn('FRONTEND_URL = "/climate_flow_scheduler/climate-flow-card.js"', const)
        self.assertIn('StaticPathConfig("/climate_flow_scheduler", str(www_path)', integration)
        # The dashboard resource is loaded as soon as the integration is set
        # up, so it must be registered in async_setup: async_setup_entry can
        # fail or abort after the scheduler/sensor/service wiring, which would
        # leave the card missing from the picker without an obvious cause.
        setup_body = integration.split("async def async_setup_entry", 1)[0]
        self.assertIn("add_extra_js_url(hass, FRONTEND_URL)", setup_body)
        # A config entry reload does not re-run async_setup, so removing the
        # URL on unload would hide the card until the next HA restart.
        self.assertNotIn("remove_extra_js_url", integration)
        self.assertTrue((ROOT / "custom_components/climate_flow_scheduler/www/climate-flow-card.js").is_file())

    # Canonical cv helpers that produce an integration CONFIG_SCHEMA, as listed
    # by hassfest's config_schema check (script/hassfest/config_schema.py).
    CONFIG_SCHEMA_FACTORIES = (
        "empty_config_schema",
        "config_entry_only_config_schema",
        "platform_only_config_schema",
    )

    def _config_schema_expression(self):
        """Return the AST expression assigned to CONFIG_SCHEMA in __init__.py."""
        module = ast.parse(
            (ROOT / "custom_components/climate_flow_scheduler/__init__.py").read_text(encoding="utf-8")
        )
        for node in module.body:
            if isinstance(node, ast.Assign):
                targets = node.targets
            elif isinstance(node, ast.AnnAssign):
                targets = [node.target]
            else:
                continue
            if node.value is None:
                continue
            if any(isinstance(target, ast.Name) and target.id == "CONFIG_SCHEMA" for target in targets):
                return node.value
        self.fail("CONFIG_SCHEMA is not assigned in __init__.py")

    def test_config_schema_is_a_called_canonical_empty_schema(self):
        """CONFIG_SCHEMA must be a canonical factory's result, not the factory.

        Home Assistant validates the configuration container with
        CONFIG_SCHEMA itself (cv.async_validate(hass, component.CONFIG_SCHEMA,
        config) -> validator(config)). Assigning cv.empty_config_schema
        without calling it hands Home Assistant a function whose result is
        another function instead of the configuration mapping; the resulting
        failure in async_drop_config_annotations aborts setup, so the static
        path and frontend card are never registered (404).

        The factories below mirror the official contract from
        homeassistant/helpers/config_validation.py (verified on 2025.1.0, the
        minimum supported version, and current dev): each takes the domain
        and returns a validator returning the configuration container
        unchanged.
        """
        expression = self._config_schema_expression()
        self.assertIsInstance(
            expression,
            ast.Call,
            "CONFIG_SCHEMA must be the result of calling a canonical cv factory; "
            "a bare factory reference makes Home Assistant receive a function "
            "instead of the configuration container",
        )

        called: list[tuple[str, str]] = []

        def canonical_factory(name):
            def factory(domain):
                called.append((name, domain))

                def validator(config):
                    config.get(domain)  # official factories inspect config[domain]
                    return config

                return validator

            return factory

        cv_stub = types.SimpleNamespace(
            **{name: canonical_factory(name) for name in self.CONFIG_SCHEMA_FACTORIES}
        )
        scope = {"cv": cv_stub, "DOMAIN": "climate_flow_scheduler"}
        schema = eval(compile(ast.Expression(expression), "<CONFIG_SCHEMA>", "eval"), scope)
        self.assertTrue(callable(schema))
        self.assertEqual(
            [domain for _, domain in called],
            ["climate_flow_scheduler"],
            "CONFIG_SCHEMA must call exactly one canonical cv factory with the integration domain",
        )
        config = {"climate_flow_scheduler": {}, "other": {"key": "value"}}
        validated = schema(config)
        self.assertIsInstance(validated, Mapping)
        self.assertIs(validated, config)
        self.assertEqual(schema({}), {})


if __name__ == "__main__":
    unittest.main()
