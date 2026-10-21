"""Integration constants."""

DOMAIN = "bubble_climate_scheduler"
FRONTEND_URL = "/bubble_climate_scheduler/bubble-climate-card.js"
PLATFORMS = ("sensor",)
STORAGE_KEY = "bubble_climate_scheduler.programs"

# Home Assistant Store envelope version must remain stable; payload schema
# migrations are managed separately by STORAGE_VERSION.
STORE_VERSION = 1
STORAGE_VERSION = 2

# Config-entry version, shared between config_flow.ConfigFlow.VERSION and the
# async_migrate_entry hook. Version 2 updates the existing entry's display name.
CONFIG_ENTRY_VERSION = 2
