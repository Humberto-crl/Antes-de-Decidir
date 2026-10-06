USE antes_de_decidir;

INSERT INTO categorias (id_categoria, nombre, descripcion) VALUES
(1,'Trabajo','Primer empleo, ofertas, entrevistas y condiciones laborales'),
(2,'Educación y carrera','Elegir carrera, comparar opciones y costos de estudio'),
(3,'Finanzas','Primer salario, presupuesto, ahorro y crédito'),
(4,'Independencia','Alquiler, gastos, transporte y mudanza'),
(5,'Seguridad digital','Ofertas sospechosas, estafas y privacidad'),
(6,'Vida cotidiana','Contratos, trámites, servicios y consumo');

INSERT INTO factores (id_categoria, nombre, descripcion) VALUES
(1,'Salario mensual','Sueldo bruto mensual ofrecido (Q)'),
(1,'Transporte mensual','Gasto mensual para llegar al trabajo (Q)'),
(1,'Tiempo diario','Horas al día entre trabajo y traslado'),
(1,'Compatibilidad con estudios','¿Puedo seguir estudiando?'),
(1,'Experiencia que aporta','Qué tanto me hace crecer'),
(1,'Tipo de contrato','Formal, temporal, por servicios'),
(1,'Prestaciones','IGSS, bono 14, aguinaldo, vacaciones'),
(2,'Costo mensual','Mensualidad y gastos de estudio (Q)'),
(2,'Duración','Años o semestres que toma'),
(2,'Salida laboral','Oportunidades de trabajo al terminar'),
(2,'Ubicación','Distancia y modalidad (presencial o virtual)'),
(2,'Becas o ayuda disponible','Becas, descuentos o financiamiento'),
(3,'Ingresos mensuales','Dinero que recibo al mes (Q)'),
(3,'Gastos fijos','Gastos que se repiten cada mes (Q)'),
(3,'Ahorro mensual','Cuánto puedo guardar al mes (Q)'),
(3,'Deudas','Deudas o créditos actuales'),
(4,'Costo de alquiler','Renta mensual (Q)'),
(4,'Servicios','Agua, luz, internet y otros (Q)'),
(4,'Transporte','Gasto mensual de movilidad (Q)'),
(4,'Distancia al trabajo o estudio','Tiempo de traslado'),
(5,'Fuente de la oferta','¿Quién la envía y por qué medio?'),
(5,'Pide pagos adelantados','¿Solicitan dinero antes de dar algo?'),
(5,'Pide datos personales o bancarios','¿Piden DPI, contraseñas o tarjetas?'),
(5,'Verificación de la empresa','¿Se pudo comprobar que existe?'),
(6,'Costo total','Precio final con todos los cargos (Q)'),
(6,'Plazo','Duración del contrato o trámite'),
(6,'Cláusulas importantes','Penalizaciones, renovación automática, garantías'),
(6,'Documentos requeridos','Qué papeles necesito');
