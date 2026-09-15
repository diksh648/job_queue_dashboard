import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JobStatus } from './job-status.enum';
import { Job } from './job.entity';

const transitions: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.RUNNING, JobStatus.FAILED],
  [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.FAILED]: []
};

@Injectable()
export class JobsService {
  constructor(@InjectRepository(Job) private readonly jobs: Repository<Job>) {}

  create(dto: CreateJobDto) {
    return this.jobs.save(this.jobs.create({ ...dto, status: JobStatus.PENDING }));
  }

  findAll() {
    return this.jobs.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const job = await this.jobs.findOneBy({ id });
    if (!job) throw new NotFoundException('Job not found');
    if (job.status === dto.status) return job;
    if (!transitions[job.status].includes(dto.status)) {
      throw new ConflictException(`Cannot transition a ${job.status} job to ${dto.status}`);
    }

    // The old status is part of the UPDATE predicate: concurrent requests cannot
    // both successfully transition the same version of a job.
    const result = await this.jobs
      .createQueryBuilder()
      .update(Job)
      .set({ status: dto.status })
      .where('id = :id AND status = :currentStatus', { id, currentStatus: job.status })
      .execute();
    if (result.affected !== 1) throw new ConflictException('Job changed by another request; refresh and try again');
    return this.jobs.findOneByOrFail({ id });
  }

  async remove(id: string) {
    const result = await this.jobs.delete(id);
    if (result.affected !== 1) throw new NotFoundException('Job not found');
  }
}
