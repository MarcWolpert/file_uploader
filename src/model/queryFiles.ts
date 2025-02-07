import { PrismaClient } from '@prisma/client';

function tryError(
	target: any,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) {
	const originalMethod = descriptor.value;
	descriptor.value = async function (...args: any[]) {
		// Ensure the prismaClient property exists on the instance.
		try {
			// Await the original method if it returns a Promise.
			return await originalMethod.apply(this, args);
		} catch (error) {
			console.error('Error:', error);
			throw error;
		} finally {
		}
	};
	return descriptor;
}

export class PrismaHelper {
	constructor() {}

	@tryError
	async crudGeneral(
		client: PrismaClient,
		callback: (client: PrismaClient) => Promise<any>,
	) {
		return await callback(client);
	}

	// Apply the decorator to other methods if necessary.
	@tryError
	async createFile() {
		// Your implementation here...
	}

	@tryError
	async createManyFiles() {
		// Your implementation here...
	}
}
