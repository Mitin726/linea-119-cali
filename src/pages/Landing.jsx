// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import {
  Siren, Phone, ArrowRight, FileText, ShieldCheck, Truck,
  Flame, Wind, Car, Waves, ChevronDown, MousePointerClick,
} from 'lucide-react';
import EscenaLanding from '../three/EscenaLanding';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { GRUPOS } from '../data/grupos';
import { INFO_GRUPO } from '../data/gruposInfo';
import './Landing.css';

const PASOS = [
  {
    Icono: FileText,
    titulo: 'Cuentas qué pasa',
    texto: 'Eliges el tipo de emergencia, describes lo que ves y marcas el lugar exacto en el mapa.',
  },
  {
    Icono: ShieldCheck,
    titulo: 'Un radio operador valida',
    texto: 'Tu reporte llega al centro de despacho con fotos y coordenadas. Si hace falta, te llama.',
  },
  {
    Icono: Truck,
    titulo: 'La unidad va en camino',
    texto: 'Se despacha la máquina, rescate, ambulancia o HazMat, y tú ves cada cambio de estado.',
  },
];

const SEGURIDAD = [
  { Icono: Flame, titulo: 'Incendio', tips: ['Sal del lugar y no regreses por objetos.', 'Si hay humo, avanza agachado.', 'Cierra puertas detrás de ti.'] },
  { Icono: Wind, titulo: 'Fuga de gas', tips: ['No enciendas luces ni aparatos.', 'Abre puertas y ventanas.', 'Cierra el registro si es seguro.'] },
  { Icono: Car, titulo: 'Accidente de tránsito', tips: ['Señaliza la vía y aléjate de los carros.', 'No muevas a los heridos.', 'No retires el casco a motociclistas.'] },
  { Icono: Waves, titulo: 'Inundación', tips: ['Sube a un lugar alto.', 'No cruces corrientes de agua.', 'Desconecta la energía si puedes.'] },
];

const PREGUNTAS = [
  {
    p: '¿Este canal reemplaza la llamada al 119?',
    r: 'No. Es un canal adicional. Si hay riesgo inmediato para la vida, llama al 119. El reporte digital ayuda cuando una foto o la ubicación exacta aceleran el despacho.',
  },
  {
    p: '¿Necesito crear una cuenta?',
    r: 'No. Solo pedimos los datos del protocolo de despacho: tu nombre, un teléfono de contacto y la información de la emergencia.',
  },
  {
    p: '¿Cómo sé que recibieron mi reporte?',
    r: 'Al enviarlo recibes un número de radicado y una pantalla de seguimiento que se actualiza cuando el radio operador valida, despacha o cierra el caso.',
  },
  {
    p: '¿Qué pasa con mis fotos y videos?',
    r: 'Solo los ve el radio operador para entender la emergencia. Puedes adjuntar hasta tres archivos.',
  },
];

export default function Landing() {
  return (
    <div className="landing">
      <SiteHeader />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__texto">
              <span className="hero__badge">
                <span className="hero__badge-dot" aria-hidden="true" /> Línea 119 · Canal digital
              </span>
              <h1 className="hero__titulo">¿Tienes una emergencia?</h1>
              <p className="hero__subtitulo">
                Repórtala con tu ubicación y fotos. Llega directo al radio operador
                de Bomberos Cali y ves su estado en tiempo real.
              </p>
              <div className="hero__acciones">
                <Link to="/reportar" className="btn btn--primary btn--lg">
                  <Siren size={20} /> Reportar emergencia <ArrowRight size={18} />
                </Link>
                <a href="tel:119" className="btn btn--on-dark btn--lg">
                  <Phone size={18} /> Llamar al 119
                </a>
              </div>
            </div>

            <div className="hero__escena">
              <div className="hero__canvas" aria-label="Botón de emergencia 3D: haz clic para activar la alarma">
                <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1.5} />
                  <Environment preset="city" />
                  <EscenaLanding />
                  <OrbitControls enableZoom={false} enablePan={false} />
                </Canvas>
              </div>
              <p className="hero__pista">
                <MousePointerClick size={14} /> Haz clic en el botón
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Aviso ---------- */}
        <div className="aviso">
          <div className="container aviso__inner">
            <Phone size={18} />
            <p>
              <strong>Si alguien está en peligro inmediato, llama primero al 119.</strong> El reporte
              digital complementa la llamada, no la reemplaza.
            </p>
          </div>
        </div>

        {/* ---------- Cómo funciona ---------- */}
        <section id="como-funciona" className="seccion">
          <div className="container">
            <header className="seccion__encabezado">
              <span className="eyebrow">Cómo funciona</span>
              <h2 className="seccion__titulo">De tu reporte al despacho, en tres pasos</h2>
              <p className="seccion__desc">
                El formulario sigue el mismo interrogatorio que hace el radio operador por teléfono,
                así que no pierdes tiempo repitiendo información.
              </p>
            </header>
            <ol className="pasos">
              {PASOS.map(({ Icono, titulo, texto }, i) => (
                <li key={titulo} className="paso">
                  <div className="paso__icono"><Icono size={22} /></div>
                  <span className="paso__num mono">0{i + 1}</span>
                  <h3 className="paso__titulo">{titulo}</h3>
                  <p className="paso__texto">{texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Grupos ---------- */}
        <section id="grupos" className="seccion seccion--alterna">
          <div className="container">
            <header className="seccion__encabezado">
              <span className="eyebrow">Protocolo de despacho</span>
              <h2 className="seccion__titulo">¿Qué tipo de emergencia quieres reportar?</h2>
              <p className="seccion__desc">
                Son los siete grupos que usa Bomberos Cali para clasificar cada llamada.
                Elige uno para empezar tu reporte.
              </p>
            </header>
            <div className="grupos">
              {GRUPOS.map((g) => {
                const { Icono, ejemplos } = INFO_GRUPO[g.codigo];
                return (
                  <Link
                    key={g.codigo}
                    to={`/reportar?grupo=${g.codigo}`}
                    className="grupo"
                    style={{ '--grupo': g.color }}
                  >
                    <div className="grupo__top">
                      <span className="grupo__icono"><Icono size={22} /></span>
                      <span className="grupo__codigo mono">{g.codigo}</span>
                    </div>
                    <h3 className="grupo__nombre">{g.nombre}</h3>
                    <p className="grupo__ejemplos">{ejemplos}</p>
                    <span className="grupo__cta">
                      Reportar <ArrowRight size={16} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Seguridad ---------- */}
        <section id="seguridad" className="seccion">
          <div className="container">
            <header className="seccion__encabezado">
              <span className="eyebrow">Mientras llega la ayuda</span>
              <h2 className="seccion__titulo">Qué hacer en los primeros minutos</h2>
              <p className="seccion__desc">
                Tu seguridad es lo primero. Nunca te pongas en riesgo para tomar una foto.
              </p>
            </header>
            <div className="seguridad">
              {SEGURIDAD.map(({ Icono, titulo, tips }) => (
                <article key={titulo} className="seguridad__card">
                  <div className="seguridad__icono"><Icono size={20} /></div>
                  <h3 className="seguridad__titulo">{titulo}</h3>
                  <ul className="seguridad__lista">
                    {tips.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Preguntas ---------- */}
        <section id="preguntas" className="seccion seccion--alterna">
          <div className="container faq">
            <header className="seccion__encabezado seccion__encabezado--izq">
              <span className="eyebrow">Preguntas frecuentes</span>
              <h2 className="seccion__titulo">Lo que debes saber antes de reportar</h2>
              <p className="seccion__desc">
                ¿Tienes otra duda? En una emergencia, siempre puedes llamar al <a href="tel:119">119</a>.
              </p>
            </header>
            <div className="faq__lista">
              {PREGUNTAS.map(({ p, r }) => (
                <details key={p} className="faq__item">
                  <summary>
                    {p}
                    <ChevronDown size={18} className="faq__chevron" />
                  </summary>
                  <p>{r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section className="cta">
          <div className="container cta__inner">
            <div>
              <h2 className="cta__titulo">¿Estás viendo una emergencia ahora?</h2>
              <p className="cta__texto">Reporta en menos de dos minutos. Un radio operador lo revisará de inmediato.</p>
            </div>
            <div className="cta__acciones">
              <Link to="/reportar" className="btn btn--primary btn--lg">
                <Siren size={20} /> Reportar emergencia
              </Link>
              <a href="tel:119" className="btn btn--on-dark btn--lg">
                <Phone size={18} /> Llamar al 119
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
