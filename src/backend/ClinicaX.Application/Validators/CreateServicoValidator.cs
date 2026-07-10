using ClinicaX.Application.DTOs;
using FluentValidation;

namespace ClinicaX.Application.Validators;

public class CreateServicoValidator : AbstractValidator<CreateServicoRequest>
{
    public CreateServicoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DuracaoMin).GreaterThan(0);
        RuleFor(x => x.Valor).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Descricao).MaximumLength(500);
    }
}

public class UpdateServicoValidator : AbstractValidator<UpdateServicoRequest>
{
    public UpdateServicoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DuracaoMin).GreaterThan(0);
        RuleFor(x => x.Valor).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Descricao).MaximumLength(500);
    }
}
