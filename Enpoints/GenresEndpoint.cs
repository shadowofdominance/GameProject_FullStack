using GameProject.Data;
using GameProject.Dtos;
using GameProject.Models;
using Microsoft.EntityFrameworkCore;

namespace GameProject.Enpoints;

public static class GenresEndpoint
{
    const string getGenreEndpointName = "GetGenre";

    public static void MapGenresEndpoint(this WebApplication app)
    {
        var group = app.MapGroup("/genres");

        // GET /genres
        group.MapGet("/", async (GameStoreContext dbContext) =>
            await dbContext.Genres.Select(genre => new GenreDto(genre.Id, genre.Name))
                .AsNoTracking()
                .ToListAsync());

        // GET /genres/{id}
        group.MapGet("/{id}", async (int id, GameStoreContext dbContext) =>
        {
            var genre = await dbContext.Genres.FindAsync(id);
            return genre is null 
                ? Results.NotFound() 
                : Results.Ok(new GenreDto(genre.Id, genre.Name));
        }).WithName(getGenreEndpointName);

        // POST /genres
        group.MapPost("/", async (CreateGenreDto newGenre, GameStoreContext dbContext) =>
        {
            var trimmedName = newGenre.Name.Trim();
            var exists = await dbContext.Genres.AnyAsync(g => g.Name.ToLower() == trimmedName.ToLower());
            if (exists)
            {
                return Results.Conflict(new { message = $"Genre '{trimmedName}' already exists." });
            }

            Genre genre = new()
            {
                Name = trimmedName
            };

            dbContext.Genres.Add(genre);
            await dbContext.SaveChangesAsync();

            GenreDto genreDto = new(genre.Id, genre.Name);
            return Results.CreatedAtRoute(getGenreEndpointName, new { id = genreDto.Id }, genreDto);
        });

        // DELETE /genres/{id}
        group.MapDelete("/{id}", async (int id, GameStoreContext dbContext) =>
        {
            var hasGames = await dbContext.Games.AnyAsync(g => g.GenreId == id);
            if (hasGames)
            {
                return Results.BadRequest(new { message = "Cannot delete genre because games are assigned to it." });
            }

            var deleted = await dbContext.Genres.Where(g => g.Id == id).ExecuteDeleteAsync();
            return deleted > 0 ? Results.NoContent() : Results.NotFound();
        });
    }
}
