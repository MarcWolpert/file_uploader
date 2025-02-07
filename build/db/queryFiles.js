var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function tryError(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure the prismaClient property exists on the instance.
            try {
                // Await the original method if it returns a Promise.
                return yield originalMethod.apply(this, args);
            }
            catch (error) {
                console.error('Error:', error);
                throw error;
            }
            finally {
            }
        });
    };
    return descriptor;
}
export class PrismaHelper {
    constructor(prismaClient) {
        this.prismaClient = prismaClient;
    }
    crudGeneral(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield callback(this.prismaClient);
        });
    }
    // Apply the decorator to other methods if necessary.
    createFile() {
        return __awaiter(this, void 0, void 0, function* () {
            // Your implementation here...
        });
    }
    createManyFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            // Your implementation here...
        });
    }
}
__decorate([
    tryError
], PrismaHelper.prototype, "crudGeneral", null);
__decorate([
    tryError
], PrismaHelper.prototype, "createFile", null);
__decorate([
    tryError
], PrismaHelper.prototype, "createManyFiles", null);
//# sourceMappingURL=queryFiles.js.map