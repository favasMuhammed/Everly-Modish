import re
import sys

def redesign():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            html = f.read()

        # Typography
        html = html.replace('Outfit:wght@300;400;500;600;700', 'Inter:wght@400;500;600;700')

        # Radii Condensing
        html = html.replace('rounded-2xl', 'rounded-xl')
        html = html.replace('rounded-xl', 'rounded-lg')

        # Shadows Flattening
        html = html.replace('shadow-2xl', 'shadow-sm')
        html = html.replace('shadow-lg', 'shadow-sm')
        html = html.replace('shadow-indigo-200', 'shadow-slate-100')

        # Unify Form Headers & Call To Actions
        # Strip bg-slate-900 headers from 'New Sale' and 'Add Product'
        # In New Sale form: <div class="bg-slate-900 p-6 text-white pb-12">
        html = html.replace('class="bg-slate-900 p-6 text-white pb-12"', 'class="p-6 pb-12 border-b border-slate-100"')
        # New Sale title text: <h2 class="text-xl font-bold"> -> <h2 class="text-xl font-bold text-slate-800">
        html = html.replace('<h2 class="text-xl font-bold">New Sale</h2>', '<h2 class="text-xl font-bold text-slate-800">New Sale</h2>')
        
        # In Add Product form (No bg-slate-900 but need to make sure buttons are flat)
        
        # Primary CTAs: bg-indigo-600 -> bg-gray-900, bg-slate-900 -> bg-gray-900
        # Wait, let's target the exact buttons:
        # Sale Submit: class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-4 flex justify-center items-center"
        # We already flattened rounded-xl to rounded-lg and shadows.
        # Let's string replace bg-indigo-600 to bg-gray-900 inside Buttons
        html = html.replace('bg-indigo-600 hover:bg-indigo-700', 'bg-gray-900 hover:bg-black')
        html = html.replace('bg-slate-800 hover:bg-slate-900', 'bg-gray-900 hover:bg-black')
        html = html.replace('bg-slate-900 hover:bg-slate-800', 'bg-gray-900 hover:bg-black')

        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print('SUCCESS')
    except Exception as e:
        print('ERROR:', str(e))

if __name__ == '__main__':
    redesign()
