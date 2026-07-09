import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('users')
@Controller('api')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('user')
  @Public()
  @ApiOperation({ summary: 'Create a user (legacy, use /auth/register instead)' })
  create(@Body() body: any) {
    return this.usersService.createUser(body);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('authorization', 'edit_users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
    });
  }

  @Get('user/id/:id')
  @Public()
  @ApiOperation({ summary: 'Get user by ID' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Get('user/username/:username')
  @Public()
  @ApiOperation({ summary: 'Get user by username' })
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Put('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.usersService.update(Number(id), body);
  }

  @Put('user/type/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('authorization', 'add_users', 'edit_users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user type (admin only)' })
  updateUserType(@Param('id') id: string, @Body('user_type_id') userTypeId: number) {
    return this.usersService.updateUserType(Number(id), userTypeId);
  }

  @Delete('user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('authorization', 'edit_users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  delete(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }
}
