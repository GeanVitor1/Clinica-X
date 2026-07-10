using ClinicaX.Application.DTOs;
using FluentValidation;

namespace ClinicaX.Application.Validators;

public class CreateAgendamentoValidator : AbstractValidator<CreateAgendamentoRequest>
{
    public CreateAgendamentoValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.ServicoId).NotEmpty();
        RuleFor(x => x.DataHoraInicio).GreaterThan(DateTime.UtcNow);
    }
}

public class RemarcarAgendamentoValidator : AbstractValidator<RemarcarAgendamentoRequest>
{
    public RemarcarAgendamentoValidator()
    {
        RuleFor(x => x.DataHoraInicio).GreaterThan(DateTime.UtcNow);
    }
}

public class CancelarAgendamentoValidator : AbstractValidator<CancelarAgendamentoRequest>
{
    public CancelarAgendamentoValidator()
    {
        RuleFor(x => x.MotivoCancelamento).NotEmpty().MaximumLength(500);
    }
}
