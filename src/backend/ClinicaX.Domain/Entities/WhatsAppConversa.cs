namespace ClinicaX.Domain.Entities;

public enum DirecaoMensagem
{
    Entrada,
    Saida
}

public enum StatusMensagemWhatsApp
{
    Pendente,
    Enviada,
    Entregue,
    Lida,
    Falha
}

/// <summary>Central de WhatsApp — conversa com um contato/paciente.</summary>
public class WhatsAppConversa : BaseEntity
{
    public Guid ClinicaId { get; set; }
    public Guid? PacienteId { get; set; }
    public string Telefone { get; set; } = string.Empty;
    public string NomeContato { get; set; } = string.Empty;
    public DateTime UltimaMensagemEm { get; set; } = DateTime.UtcNow;
    public bool NaoLida { get; set; }
    public ICollection<WhatsAppMensagem> Mensagens { get; set; } = new List<WhatsAppMensagem>();
}

public class WhatsAppMensagem : BaseEntity
{
    public Guid ConversaId { get; set; }
    public DirecaoMensagem Direcao { get; set; }
    public string Conteudo { get; set; } = string.Empty;
    public StatusMensagemWhatsApp Status { get; set; } = StatusMensagemWhatsApp.Pendente;
    public DateTime EnviadaEm { get; set; } = DateTime.UtcNow;
    public bool Automatica { get; set; }
}
