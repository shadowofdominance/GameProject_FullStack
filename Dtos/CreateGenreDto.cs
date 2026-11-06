using System.ComponentModel.DataAnnotations;

namespace GameProject.Dtos;

public record CreateGenreDto(
    [Required][StringLength(30)] string Name
);
