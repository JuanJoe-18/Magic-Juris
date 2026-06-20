"""
Service for judicial actuation classification and alert generation.
"""

def classify_actuation(tipo: str, anotacion: str) -> dict:
    """
    Classify judicial actuation based on type and annotation.
    Returns dict with clasificacion (ALTA/MEDIA/BAJA) and urgencia level.
    """
    tipo_lower = tipo.lower()
    anotacion_lower = anotacion.lower()
    
    # ALTA / crítica
    alta_keywords = [
        "audiencia", "vencimiento", "término", "fallo", "sentencia",
        "notificación", "mandamiento", "traslado con término",
        "inadmite", "requiere subsanar", "auto admite demanda",
        "embargo", "medida cautelar", "ejecutoriado"
    ]
    
    # MEDIA / importante
    media_keywords = [
        "traslado", "prueba", "contestación", "memorial",
        "recurso", "despacho", "auto que ordena",
        "radicación memorial", "apelación", "casación"
    ]
    
    # BAJA / informativa
    baja_keywords = [
        "constancia", "secretaría", "al despacho",
        "fijación en lista", "actualización", "archivo",
        "cambio menor", "notificación simple", "certificado"
    ]
    
    # Check type and annotation
    combined = f"{tipo_lower} {anotacion_lower}"
    
    for keyword in alta_keywords:
        if keyword in combined:
            return {"clasificacion": "ALTA", "urgencia": "CRÍTICA"}
    
    for keyword in media_keywords:
        if keyword in combined:
            return {"clasificacion": "MEDIA", "urgencia": "IMPORTANTE"}
    
    for keyword in baja_keywords:
        if keyword in combined:
            return {"clasificacion": "BAJA", "urgencia": "INFORMATIVA"}
    
    # Default to BAJA
    return {"clasificacion": "BAJA", "urgencia": "INFORMATIVA"}


def get_alert_for_actuation(actuation_clasificacion: str) -> dict:
    """
    Generate alert based on actuation classification.
    Returns dict with alert config (tipo, nivel, mensaje, canal).
    """
    if actuation_clasificacion == "ALTA":
        return {
            "tipo": "actuacion_critica",
            "nivel": "ALTA",
            "canal": "interno",
            "mensaje_template": "Actuación crítica detectada: {tipo} - Requiere atención inmediata"
        }
    elif actuation_clasificacion == "MEDIA":
        return {
            "tipo": "actuacion_importante",
            "nivel": "MEDIA",
            "canal": "interno",
            "mensaje_template": "Actuación importante: {tipo} - Requiere revisión"
        }
    else:
        return {
            "tipo": "actuacion_informativa",
            "nivel": "BAJA",
            "canal": "interno",
            "mensaje_template": "Actualización de caso: {tipo}"
        }
