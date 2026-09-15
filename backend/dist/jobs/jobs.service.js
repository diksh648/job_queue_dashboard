"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_status_enum_1 = require("./job-status.enum");
const job_entity_1 = require("./job.entity");
const transitions = {
    [job_status_enum_1.JobStatus.PENDING]: [job_status_enum_1.JobStatus.RUNNING, job_status_enum_1.JobStatus.FAILED],
    [job_status_enum_1.JobStatus.RUNNING]: [job_status_enum_1.JobStatus.COMPLETED, job_status_enum_1.JobStatus.FAILED],
    [job_status_enum_1.JobStatus.COMPLETED]: [],
    [job_status_enum_1.JobStatus.FAILED]: []
};
let JobsService = class JobsService {
    constructor(jobs) {
        this.jobs = jobs;
    }
    create(dto) {
        return this.jobs.save(this.jobs.create({ ...dto, status: job_status_enum_1.JobStatus.PENDING }));
    }
    findAll() {
        return this.jobs.find({ order: { createdAt: 'DESC' } });
    }
    async updateStatus(id, dto) {
        const job = await this.jobs.findOneBy({ id });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        if (job.status === dto.status)
            return job;
        if (!transitions[job.status].includes(dto.status)) {
            throw new common_1.ConflictException(`Cannot transition a ${job.status} job to ${dto.status}`);
        }
        const result = await this.jobs
            .createQueryBuilder()
            .update(job_entity_1.Job)
            .set({ status: dto.status })
            .where('id = :id AND status = :currentStatus', { id, currentStatus: job.status })
            .execute();
        if (result.affected !== 1)
            throw new common_1.ConflictException('Job changed by another request; refresh and try again');
        return this.jobs.findOneByOrFail({ id });
    }
    async remove(id) {
        const result = await this.jobs.delete(id);
        if (result.affected !== 1)
            throw new common_1.NotFoundException('Job not found');
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], JobsService);
//# sourceMappingURL=jobs.service.js.map