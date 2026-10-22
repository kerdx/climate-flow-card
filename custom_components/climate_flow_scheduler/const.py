"""Integration constants."""

DOMAIN = "climate_flow_scheduler"
FRONTEND_URL = "/climate_flow_scheduler/climate-flow-card.js"
PLATFORMS = ("sensor",)
STORAGE_KEY = "climate_flow_scheduler.programs"

# Home Assistant Store envelope version must remain stable; payload schema
# migrations are managed separately by STORAGE_VERSION.
STORE_VERSION = 1
STORAGE_VERSION = 2

# Config-entry version, shared between config_flow.ConfigFlow.VERSION and the
# async_migrate_entry hook. This is a new domain with no prior entries.
CONFIG_ENTRY_VERSION = 1
