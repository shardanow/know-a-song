import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRolesService } from './user-roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('user-roles')
@Controller('api/user-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('authorization')
@ApiBearerAuth()
export class UserRolesController {
  constructor(private userRolesService: UserRolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user types' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.userRolesService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user type by ID' })
  findById(@Param('id') id: string) {
    return this.userRolesService.findById(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a user type' })
  create(@Body() body: any) {
    return this.userRolesService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user type' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.userRolesService.update(Number(id), body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user type' })
  delete(@Param('id') id: string) {
    return this.userRolesService.delete(Number(id));
  }
}
