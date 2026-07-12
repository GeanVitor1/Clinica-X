namespace ClinicaX.Domain.Entities;

public class Clinica : BaseEntity
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Endereco { get; set; } = string.Empty;
    public string Plano { get; set; } = "Mensal";
    public TimeSpan HorarioAbertura { get; set; } = new(8, 0, 0);
    public TimeSpan HorarioFechamento { get; set; } = new(18, 0, 0);

    /// <summary>
    /// Dias de funcionamento como DayOfWeek separados por vírgula (0=Domingo … 6=Sábado).
    /// Padrão: segunda a sexta (1,2,3,4,5).
    /// </summary>
    public string DiasFuncionamento { get; set; } = "1,2,3,4,5";

    /// <summary>
    /// Clínica de demonstração com dados mockados (seed). Contas reais gravam dados próprios.
    /// </summary>
    public bool IsDemo { get; set; }

    public bool OperaNoDia(DayOfWeek day)
    {
        if (string.IsNullOrWhiteSpace(DiasFuncionamento))
            return true;

        var target = ((int)day).ToString();
        return DiasFuncionamento
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Any(d => d == target);
    }
}
