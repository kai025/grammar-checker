# Backend Architecture - Domain-Driven Structure

This backend follows a domain-driven design approach, organizing code by business domains rather than technical layers.

## 📁 Directory Structure

```
src/
├── pnl/                          # PnL (Profit & Loss) domain
│   ├── types/
│   │   ├── index.ts              # Export all PnL types
│   │   ├── pnl-report.types.ts   # PnL report interfaces
│   │   └── pnl-trends.types.ts   # PnL trends interfaces
│   ├── controllers/
│   │   └── pnl.controller.ts     # PnL business logic
│   ├── routes/
│   │   ├── pnl.routes.ts         # PnL API routes
│   │   └── pnl-detailed.routes.ts # Detailed PnL routes
│   └── services/
│       └── PnlService.ts         # PnL data operations
│
├── data-sources/                  # Data sources domain
│   ├── types/
│   │   ├── index.ts
│   │   └── data-source.types.ts  # Data source interfaces
│   ├── controllers/
│   │   └── data-source.controller.ts
│   ├── routes/
│   │   └── data-sources.routes.ts
│   └── services/
│       └── data-source.service.ts
│
├── auth/                          # Authentication domain
│   ├── types/
│   │   ├── index.ts
│   │   └── auth.types.ts         # Auth interfaces
│   ├── controllers/
│   │   └── AuthController.ts     # Auth business logic
│   ├── routes/
│   │   └── auth.routes.ts        # Auth API routes
│   └── services/
│       └── auth.service.ts       # Auth data operations
│
├── users/                         # Users domain
│   ├── types/
│   │   ├── index.ts
│   │   └── user.types.ts         # User interfaces
│   ├── controllers/
│   │   └── UsersController.ts    # User business logic
│   ├── routes/
│   │   └── users.routes.ts       # User API routes
│   └── services/
│       └── user.service.ts       # User data operations
│
├── organizations/                 # Organizations domain
│   ├── types/
│   │   ├── index.ts
│   │   └── organization.types.ts # Organization interfaces
│   ├── controllers/
│   │   └── organization.controller.ts
│   ├── routes/
│   │   └── organization.routes.ts
│   └── services/
│       └── organization.service.ts
│
├── common/                        # Shared utilities
│   ├── types/
│   │   ├── index.ts              # Export all common types
│   │   └── common.types.ts       # Common interfaces
│   ├── controllers/
│   │   └── BaseController.ts     # Base controller class
│   ├── middleware/
│   │   └── auth.ts               # Auth middleware
│   ├── utils/
│   │   └── swagger.ts            # Swagger configuration
│   └── constants/
│       └── index.ts              # Shared constants
│
└── server.ts                      # Main server file
```

## 🏗️ Architecture Principles

### **Domain-Driven Design**
- Each business domain is self-contained
- Related functionality is grouped together
- Clear boundaries between domains

### **Separation of Concerns**
- **Types**: TypeScript interfaces and types
- **Controllers**: Business logic and request handling
- **Routes**: API endpoint definitions
- **Services**: Data access and external integrations

### **Shared Resources**
- **Common**: Utilities, middleware, and base classes
- **Types**: Reusable interfaces across domains
- **Constants**: Application-wide constants

## 🔄 Development Workflow

### **Adding New Features**
1. **Identify Domain**: Determine which domain the feature belongs to
2. **Create Types**: Define interfaces in the domain's `types/` folder
3. **Implement Service**: Add data operations in the domain's `services/` folder
4. **Add Controller**: Implement business logic in the domain's `controllers/` folder
5. **Define Routes**: Create API endpoints in the domain's `routes/` folder

### **Cross-Domain Dependencies**
- Use the `common/` folder for shared functionality
- Import types from other domains when needed
- Keep domain boundaries clear

## 📝 File Naming Conventions

- **Types**: `domain-name.types.ts`
- **Controllers**: `domain-name.controller.ts`
- **Routes**: `domain-name.routes.ts`
- **Services**: `DomainNameService.ts` or `domain-name.service.ts`

## 🚀 Benefits

1. **Scalability**: Easy to add new domains without affecting existing ones
2. **Maintainability**: Related code is grouped together
3. **Team Collaboration**: Multiple developers can work on different domains
4. **Clear Dependencies**: Each domain's dependencies are explicit
5. **Testing**: Easy to test each domain independently

## 🔧 Migration Status

- ✅ **PnL Domain**: Fully migrated
- ✅ **Auth Domain**: Fully migrated  
- ✅ **Users Domain**: Fully migrated
- ✅ **Data Sources Domain**: Partially migrated
- ⏳ **Organizations Domain**: Structure created, needs implementation
- ⏳ **Other Domains**: Still in old structure (reports, workflows, etc.)

## 📋 TODO

- [ ] Complete data-sources domain migration
- [ ] Implement organizations domain
- [ ] Migrate remaining routes (reports, workflows, forecasts, etc.)
- [ ] Add comprehensive error handling per domain
- [ ] Implement domain-specific validation
- [ ] Add domain-specific tests
