# Prisma Schema Organization

This directory contains the Prisma schema organized into separate files for better maintainability.

## File Structure

```
prisma/
├── base.prisma              # Generator and datasource configuration
├── enums.prisma             # All enum definitions
├── models/
│   ├── core.prisma          # Core entities (Organization, User, UserSession)
│   ├── data-sources.prisma  # Data source related models
│   └── pnl.prisma           # PnL (Profit & Loss) models
├── schema.prisma            # Auto-generated combined schema (DO NOT EDIT)
└── README.md               # This file
```

## How to Use

### Editing Schema Files

1. **Enums**: Edit `enums.prisma` to add or modify enum definitions
2. **Core Models**: Edit `models/core.prisma` for Organization, User, and UserSession models
3. **Data Sources**: Edit `models/data-sources.prisma` for DataSource, FinancialData, and CustomerData models
4. **PnL Models**: Edit `models/pnl.prisma` for PnL-related models

### Building the Schema

After making changes to any of the separate files, rebuild the combined schema:

```bash
# Using npm script
npm run db:build-schema

# Or directly
node scripts/build-schema.js
```

### Database Operations

After rebuilding the schema, you can perform database operations:

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Reset database (WARNING: This will delete all data)
npm run db:reset

# Seed database with sample data
npm run db:seed
```

## Important Notes

- **DO NOT EDIT** `schema.prisma` directly - it is auto-generated
- Always run `npm run db:build-schema` after editing any of the separate files
- The build script will combine all files and create the final `schema.prisma`
- Make sure all model files are properly referenced in the build script

## Schema Organization Benefits

1. **Better Organization**: Related models are grouped together
2. **Easier Maintenance**: Smaller, focused files are easier to understand
3. **Team Collaboration**: Multiple developers can work on different model files
4. **Clear Separation**: Enums, core models, and domain-specific models are separated
5. **Version Control**: Easier to track changes to specific parts of the schema

## Adding New Models

To add new models:

1. Create a new file in `models/` directory (e.g., `models/reports.prisma`)
2. Add your models to the new file
3. Update `scripts/build-schema.js` to include the new file
4. Run `npm run db:build-schema` to regenerate the combined schema
5. Run `npm run db:generate` to update the Prisma client
