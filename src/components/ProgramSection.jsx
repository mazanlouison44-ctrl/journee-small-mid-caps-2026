import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Calendar, Coffee, Users, CheckCircle2 } from 'lucide-react';

export const ProgramSection = () => {
  const { program, eventInfo } = useApp();

  return (
    <section id="programme" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-semibold tracking-wider uppercase mb-2">
            Planning de l'événement
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Programme de la Journée
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Déroulement officiel du {eventInfo.dateFormatted} (8h30 – 18h00)
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="max-w-3xl mx-auto relative">
          
          {/* Vertical Connecting Bar */}
          <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-0.5 bg-blue-200 transform -translate-x-1/2 hidden sm:block"></div>
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-blue-200 sm:hidden"></div>

          <div className="space-y-8">
            {program.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.id || index}
                  className="relative flex flex-col sm:flex-row items-start sm:items-center"
                >
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-6 sm:left-1/2 transform -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white border-2 border-blue-900 flex items-center justify-center text-blue-900 shadow-sm font-bold text-xs">
                    {index + 1}
                  </div>

                  {/* Content Container */}
                  <div className={`w-full sm:w-1/2 pl-14 sm:pl-0 ${
                    isEven ? 'sm:pr-12 sm:text-right' : 'sm:pl-12 sm:ml-auto'
                  }`}>
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`flex items-center gap-2 mb-2 ${
                        isEven ? 'sm:justify-end' : 'justify-start'
                      }`}>
                        <span className="inline-flex items-center px-3 py-1 bg-blue-900 text-white rounded-md text-sm font-extrabold font-display shadow-xs">
                          <Clock className="w-3.5 h-3.5 mr-1 text-blue-200" />
                          {item.time}
                        </span>
                        {item.badge && (
                          <span className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 font-display">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
