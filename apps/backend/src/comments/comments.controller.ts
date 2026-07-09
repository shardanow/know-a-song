import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('comments')
@Controller('api')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('comments/film/:filmId')
  @Public()
  @ApiOperation({ summary: 'Get comments for a film' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByFilmId(
    @Param('filmId') filmId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findByFilmId(
      Number(filmId),
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comment' })
  create(@Body() body: { filmId: number; content: string }, @Req() req: any) {
    return this.commentsService.create({
      filmId: body.filmId,
      content: body.content,
      ownerId: req.user.id,
    });
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own comment' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.delete(Number(id), req.user.id);
  }
}
