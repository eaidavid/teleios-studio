import React from 'react';
import { Heart, MessageCircle, Send, Play } from 'lucide-react';
import './ServiceArt.css';

/* Ilustrações de cada serviço, desenhadas em código. */
const ServiceArt = ({ type }) => {
  switch (type) {
    case 'brand':
      return (
        <div className="sa sa--brand" aria-hidden="true">
          <div className="sa-brand__grid" />
          <div className="sa-brand__mark">
            <i className="c1" /><i className="c2" /><i className="c3" />
            <span>T</span>
          </div>
          <div className="sa-brand__specs">
            <div className="sa-brand__sw"><i style={{ background: '#00C48C' }} /><i style={{ background: '#E9EEEC' }} /><i style={{ background: '#1F3C88' }} /></div>
            <span className="sa-brand__aa">Aa <em>Aa</em></span>
          </div>
        </div>
      );
    case 'feed':
      return (
        <div className="sa sa--feed" aria-hidden="true">
          <div className="sa-feed__profile">
            <span className="sa-feed__avatar">T</span>
            <div><b>suaempresa</b><small>Perfil profissional</small></div>
          </div>
          <div className="sa-feed__grid">
            <i className="t-a"><b>Antes<br />× depois</b></i>
            <i className="t-b"><Play size={20} fill="currentColor" /></i>
            <i className="t-c"><b>“</b></i>
            <i className="t-d"><b>5 erros<br />que custam caro</b></i>
            <i className="t-e" />
            <i className="t-f"><b>Bastidores</b></i>
            <i className="t-g"><Play size={20} fill="currentColor" /></i>
            <i className="t-h"><b>Agende</b></i>
            <i className="t-i" />
          </div>
        </div>
      );
    case 'ad':
      return (
        <div className="sa sa--ad" aria-hidden="true">
          <div className="sa-ad__card">
            <div className="sa-ad__head">
              <span className="sa-feed__avatar">T</span>
              <div><b>Sua Empresa</b><small>Patrocinado</small></div>
            </div>
            <div className="sa-ad__media">
              <span>Agende sua<br /><em>avaliação</em></span>
            </div>
            <div className="sa-ad__cta">
              <span>Enviar mensagem</span>
              <Send size={14} />
            </div>
            <div className="sa-ad__icons"><Heart size={18} /><MessageCircle size={18} /><Send size={18} /></div>
          </div>
          <div className="sa-ad__pop"><MessageCircle size={14} /> Nova conversa</div>
        </div>
      );
    case 'reel':
      return (
        <div className="sa sa--reel" aria-hidden="true">
          <div className="sa-reel__phone">
            <div className="sa-reel__bars"><i /><i /><i /></div>
            <div className="sa-reel__caption">
              <span>Você sabia</span>
              <span>que <em>3 segundos</em></span>
              <span>decidem tudo?</span>
            </div>
            <div className="sa-reel__side"><Heart size={18} /><MessageCircle size={18} /><Send size={18} /></div>
          </div>
        </div>
      );
    case 'site':
    default:
      return (
        <div className="sa sa--site" aria-hidden="true">
          <div className="sa-site__browser">
            <div className="sa-site__bar"><i /><i /><i /><span>suaempresa.com.br</span></div>
            <div className="sa-site__page">
              <small>Clínica · Sorocaba</small>
              <strong>O sorriso que<br />você <em>adia</em> há anos.</strong>
              <span className="sa-site__btn">Agendar pelo WhatsApp</span>
            </div>
          </div>
          <div className="sa-site__mobile">
            <small>Clínica</small>
            <strong>O sorriso que você <em>adia</em>.</strong>
            <span className="sa-site__btn">Agendar</span>
          </div>
        </div>
      );
  }
};

export default ServiceArt;
