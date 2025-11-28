import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = await this.taskModel.create({
      ...createTaskDto,
      userId: userId,
    });
    return task;
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.taskModel.find({ userId: userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, userId: userId });
    
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: id, userId: userId },
      updateTaskDto,
      { new: true },
    );

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const result = await this.taskModel.findOneAndDelete({ _id: id, userId: userId });

    if (!result) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return { message: 'Task deleted successfully' };
  }
}

