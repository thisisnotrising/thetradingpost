"""NOT RISING · THE POST — THE PINK PLANT
--------------------------------------------------------------------
A big pink-leaved plant in a white pot with thin black lines, after Kathi's
reference photo (heart-shaped leaves, pink in the middle, green at the edges
and in flecks, with deep rose veins: the look of a pink caladium), built and
rendered in 3D with Blender (photographic light: a soft skylight, satin
leaves that let a little light through, a soft shadow on the floor). It
stands at the open end of the lounge's L-shaped sofa in THE POST and hides
that end. (It began as a pink monstera, so the file and names still say so.)

Output: assets/img/post/pink-monstera.webp, a see-through picture of the
plant with its floor shadow. It prints the scale it was taken at and how far
the leaves reach either side of the pot, so post.js can stand it in the room
at its real size without any leaf poking through the wall.

HOW IT'S MADE
  1. THE LEAVES. Each leaf is a picture painted here with numpy: its outline
     (a heart, with a deep notch where the stem joins), its colour (pink in
     the middle, a green edge that breaks up into green flecks, deep rose
     veins fanning out from the stem), and a "height map" so the veins sit a
     little sunken. The picture is laid on a bendable sheet in 3D; its
     see-through parts cut the leaf's shape.
  2. THE PLANT. Each leaf's sheet is curved (it droops a little toward its tip
     and folds a little along the midrib), set on a slender stem that rises
     out of the pot, and turned to face out from the plant.
  3. THE POT. A white glazed cylinder with thin black lines crossing in
     diamonds, and dark soil.
  4. THE PHOTO. A camera looks at it from a little above, straight on
     (orthographic: no wide-angle stretching, so it stays true to size).

Run it with Python and Blender's module (pip install bpy):
     python3 tools/render-monstera.py              (FAST=1 for a quick, rough test)
--------------------------------------------------------------------
"""
import os, math, random
import numpy as np
import cv2
import bpy
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'img', 'post', 'pink-monstera.webp')
TMP = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'monstera')
os.makedirs(TMP, exist_ok=True)
FAST = bool(os.environ.get('FAST'))
SCALE = 0.002                      # metres per pixel in the final picture (orthographic camera)
RES = (1300, 1300) if not FAST else (400, 400)    # (2.6 m square: room for every leaf, none cut off at the edge)
SAMPLES = 64 if not FAST else 12
TEX = 1024                         # each leaf picture is TEX x TEX pixels

# ---------------------------------------------------------------- 1 · THE LEAF PICTURES
# Leaf coordinates, in leaf-lengths: x across (-0.62 .. 0.62), y along the midrib (-0.22 at the bottom of the basal
# lobes .. 1.02 past the tip). The stem joins the leaf at (0, 0).
X0, X1, Y0, Y1 = -0.62, 0.62, -0.22, 1.02

def smoothstep(a, b, v):
    t = np.clip((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def noise(h, w, cell, rng):
    """soft random clouds: random numbers on a coarse grid, smoothly enlarged"""
    gh, gw = max(2, int(h / cell) + 3), max(2, int(w / cell) + 3)
    g = rng.random((gh, gw)).astype(np.float32)
    big = cv2.resize(g, (int(gw * cell), int(gh * cell)), interpolation=cv2.INTER_CUBIC)
    return big[:h, :w]

def leaf_picture(seed, green=0.18):
    """a heart-shaped pink leaf. green = how wide the green edge is (a share of the leaf's half-width)"""
    rng = np.random.default_rng(seed)
    n = TEX
    xs = np.linspace(X0, X1, n, dtype=np.float32)
    ys = np.linspace(Y1, Y0, n, dtype=np.float32)          # (picture rows run top to bottom: the tip at the top)
    x, y = np.meshgrid(xs, ys)
    ax = np.abs(x)
    # OUTLINE: a heart. t runs 0 (bottom of the two rounded lobes) .. 1 (the pointed tip); hw = half-width at t
    t = np.clip((y + 0.2) / 1.2, 0, 1)
    hw = 0.57 * np.clip(np.sin(np.pi * t ** 0.85), 0, 1) ** 0.58 * (1 - 0.34 * t)
    inside = (ax < hw) & (t > 0) & (t < 1)
    # the deep notch between the lobes, where the stem joins (at 0, 0)
    inside &= ~((y < 0.05) & (ax < 0.004 + 0.7 * (0.05 - y)))
    a8 = inside.astype(np.uint8)
    # how far each point is from the leaf's edge (0 at the edge), as a share of the widest
    dist = cv2.distanceTransform(a8, cv2.DIST_L2, 5)
    dist = dist / max(1.0, dist.max())
    rows = cols = n
    # VEINS: a midrib up to the tip; side veins branching off it in pairs and curving up toward the edge; and two
    # pairs from where the stem joins, running down and out into the lobes
    vein = np.zeros((rows, cols), np.uint8)
    S = lambda vx, vy: (int((vx - X0) / (X1 - X0) * (n - 1)), int((Y1 - vy) / (Y1 - Y0) * (n - 1)))
    hw_at = lambda vy: 0.57 * max(0.0, math.sin(math.pi * min(1, max(0, (vy + 0.2) / 1.2)) ** 0.85)) ** 0.58 * (1 - 0.34 * min(1, max(0, (vy + 0.2) / 1.2)))
    curves = [[(0.0, -0.02 + 0.94 * k / 40) for k in range(41)]]
    for i, yi in enumerate([0.06, 0.19, 0.32, 0.46, 0.6, 0.74]):
        for sd in (-1, 1):
            reach = hw_at(yi + 0.12) * 0.86
            rise_ = 0.20 + 0.06 * i / 5
            curves.append([(sd * reach * (k / 40), yi + rise_ * (k / 40) ** 1.6) for k in range(41)])
    for ang in (112, 140):
        for sd in (-1, 1):
            th = math.radians(ang); Lv = 0.42 if ang == 112 else 0.3
            curves.append([(sd * math.sin(th) * Lv * k / 40, math.cos(th) * Lv * k / 40 - 0.03 * (k / 40) ** 2) for k in range(41)])
    for ci, cv in enumerate(curves):
        pts = [S(px, py) for px, py in cv]
        for k in range(40):
            w = int(round((8 if ci == 0 else 5) * (1 - k / 40) + 1.5))
            cv2.line(vein, pts[k], pts[k + 1], 255, w, cv2.LINE_AA)
    # fine side veins: between the main ones, short and faint
    fine = np.zeros_like(vein)
    for ang in range(-150, 151, 9):
        th = math.radians(ang + rng.uniform(-3, 3)); L_ = rng.uniform(0.15, 0.45)
        p0 = S(math.sin(th) * 0.05, math.cos(th) * 0.05); p1 = S(math.sin(th) * L_, math.cos(th) * L_)
        cv2.line(fine, p0, p1, 255, 2, cv2.LINE_AA)
    vein = cv2.GaussianBlur(vein.astype(np.float32) / 255, (0, 0), 1.2)
    fine = cv2.GaussianBlur(fine.astype(np.float32) / 255, (0, 0), 1.0) * 0.5
    # COLOURS (light values): pink, a paler pink beside the veins, deep rose veins, two greens
    pink = np.array([0.80, 0.16, 0.42]); pale = np.array([0.93, 0.42, 0.62]); rose = np.array([0.38, 0.012, 0.11])
    g1 = np.array([0.020, 0.075, 0.022]); g2 = np.array([0.050, 0.150, 0.045])
    tone = noise(rows, cols, 60, rng)
    halo = cv2.GaussianBlur(vein, (0, 0), 10) * 1.4
    col = pink[None, None] * (1 - np.clip(halo, 0, 1)[..., None] * 0.6) + pale[None, None] * np.clip(halo, 0, 1)[..., None] * 0.6
    col = col * (0.88 + 0.24 * tone[..., None])
    # THE GREEN EDGE: green where the leaf is close to its edge; the line between green and pink is ragged, and
    # past it the green breaks up into flecks that thin out toward the middle
    rag = noise(rows, cols, 18, rng) * 0.6 + noise(rows, cols, 5, rng) * 0.4
    edge = green * (0.75 + 0.5 * rag)
    gmask = smoothstep(edge + 0.012, edge - 0.012, dist)
    fleck_p = np.clip(1 - (dist - edge) / 0.22, 0, 1) ** 2      # how likely a fleck is, by distance in from the edge
    dots = (noise(rows, cols, 3.2, rng) > 0.72).astype(np.float32) * (noise(rows, cols, 40, rng) < fleck_p * 1.1)
    gmask = np.clip(gmask + cv2.GaussianBlur(dots, (0, 0), 0.9), 0, 1)
    gmask *= (1 - 0.85 * vein)                                  # the veins stay rose right out to the edge
    gcol = g1 * (1 - tone[..., None]) + g2 * tone[..., None]
    col = col * (1 - gmask[..., None]) + gcol * gmask[..., None]
    # the veins on top
    col = col * (1 - 0.85 * vein[..., None]) + rose * 0.85 * vein[..., None]
    col = col * (1 - 0.35 * fine[..., None]) + rose * 0.35 * fine[..., None]
    a = cv2.GaussianBlur(inside.astype(np.float32), (0, 0), 0.8)
    rgba = np.dstack([np.clip(col, 0, 1) ** (1 / 2.2), a])     # (stored as sRGB)
    path = os.path.join(TMP, f'leaf{seed}.png')
    cv2.imwrite(path, cv2.cvtColor((rgba * 255).astype(np.uint8), cv2.COLOR_RGBA2BGRA))
    # HEIGHT MAP: the veins sit a little sunken; a faint quilting between them
    hmap = 0.6 - 0.35 * vein - 0.12 * fine + 0.05 * noise(rows, cols, 9, rng)
    hp = os.path.join(TMP, f'leaf{seed}_h.png')
    cv2.imwrite(hp, (np.clip(hmap, 0, 1) * 255).astype(np.uint8))
    return path, hp

# ---------------------------------------------------------------- 2 · THE SCENE
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x, scene.render.resolution_y = RES
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'Filmic' if 'Filmic' in [i.identifier for i in scene.view_settings.bl_rna.properties['view_transform'].enum_items] else 'AgX'
try: scene.view_settings.look = 'Medium High Contrast' if scene.view_settings.view_transform == 'Filmic' else 'AgX - Medium High Contrast'
except Exception: pass

def material(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links

# THE LEAF MATERIAL: the leaf picture for colour and shape (alpha), the height map for the veins, a waxy shine,
# and a little light coming through from behind (translucency)
def leaf_material(name, img_path, h_path):
    m, N, L = material(name)
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    tex = N.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(img_path); tex.interpolation = 'Cubic'
    htex = N.new('ShaderNodeTexImage'); htex.image = bpy.data.images.load(h_path); htex.image.colorspace_settings.name = 'Non-Color'
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.35; bump.inputs['Distance'].default_value = 0.002
    L.new(htex.outputs['Color'], bump.inputs['Height'])
    bsdf = N.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Roughness'].default_value = 0.42
    bsdf.inputs['Coat Weight'].default_value = 0.12
    bsdf.inputs['Coat Roughness'].default_value = 0.2
    L.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    L.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    trans = N.new('ShaderNodeBsdfTranslucent')
    L.new(tex.outputs['Color'], trans.inputs['Color'])
    mix = N.new('ShaderNodeMixShader'); mix.inputs['Fac'].default_value = 0.16
    L.new(bsdf.outputs[0], mix.inputs[1]); L.new(trans.outputs[0], mix.inputs[2])
    clear = N.new('ShaderNodeBsdfTransparent')
    cut = N.new('ShaderNodeMixShader')
    L.new(tex.outputs['Alpha'], cut.inputs['Fac'])
    L.new(clear.outputs[0], cut.inputs[1]); L.new(mix.outputs[0], cut.inputs[2])
    L.new(cut.outputs[0], out.inputs['Surface'])
    return m

def leaf_object(mat, L_len, base, mid_dir, roll, droop, fold, seed):
    """a leaf sheet: a grid in leaf coordinates, bent, then turned so its midrib points along mid_dir from base"""
    rng = random.Random(seed)
    nu, nv = 36, 40
    verts, faces, uvs = [], [], []
    for j in range(nv + 1):
        for i in range(nu + 1):
            u = i / nu; v = j / nv
            lx = X0 + (X1 - X0) * u; ly = Y0 + (Y1 - Y0) * v
            yy = max(ly, 0)
            z = -droop * yy * yy - fold * abs(lx) + 0.012 * math.sin(lx * 14 + seed) * yy
            verts.append(Vector((lx * L_len, ly * L_len, z * L_len)))
            uvs.append((u, v))
    for j in range(nv):
        for i in range(nu):
            a = j * (nu + 1) + i
            faces.append((a, a + 1, a + nu + 2, a + nu + 1))
    me = bpy.data.meshes.new(f'leaf{seed}')
    me.from_pydata([tuple(v) for v in verts], [], faces)
    uvl = me.uv_layers.new()
    for poly in me.polygons:
        for li in poly.loop_indices:
            uvl.data[li].uv = uvs[me.loops[li].vertex_index]
    for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(f'leaf{seed}', me)
    ob.data.materials.append(mat)
    bpy.context.collection.objects.link(ob)
    # turn it: leaf +y -> mid_dir; leaf +z (its face) -> as close to "up and out" as allowed, then roll
    m = mid_dir.normalized()
    side = m.cross(Vector((0, 0, 1)))
    if side.length < 1e-3: side = Vector((1, 0, 0))
    side.normalize()
    up = side.cross(m).normalized()
    R = Matrix((side, m, up)).transposed().to_4x4()
    ob.matrix_world = Matrix.Translation(base) @ R @ Matrix.Rotation(roll, 4, 'Y')
    return ob

def stem(points, radius, mat, name):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = radius; cu.bevel_resolution = 3; cu.resolution_u = 16
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(points) - 1)
    for bp, p in zip(sp.bezier_points, points):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    # thinner toward the leaf
    for k, bp in enumerate(sp.bezier_points): bp.radius = 1.0 - 0.45 * k / max(1, len(points) - 1)
    ob = bpy.data.objects.new(name, cu); ob.data.materials.append(mat)
    bpy.context.collection.objects.link(ob)
    return ob

# STEM MATERIAL: slender, green at the bottom blushing to pink up toward the leaf
sm, N, L = material('stem')
b = N['Principled BSDF']; b.inputs['Roughness'].default_value = 0.45
tc = N.new('ShaderNodeTexCoord'); sep = N.new('ShaderNodeSeparateXYZ')
L.new(tc.outputs['Generated'], sep.inputs[0])
ramp = N.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.05, 0.13, 0.04, 1); ramp.color_ramp.elements[1].color = (0.55, 0.16, 0.24, 1)
ramp.color_ramp.elements[0].position = 0.25; ramp.color_ramp.elements[1].position = 0.9
L.new(sep.outputs['Z'], ramp.inputs['Fac']); L.new(ramp.outputs['Color'], b.inputs['Base Color'])

# THE POT: a white glazed cylinder (very slightly narrower at the foot) with bold black lines crossing in diamonds,
# after Kathi's photo. It's built ring by ring so the line pattern can be painted onto it exactly.
POT_H, POT_R0, POT_R1, POT_T = 0.44, 0.215, 0.23, 0.012          # height, foot radius, top radius, wall thickness
GOLD = os.path.join(TMP, 'pot-gold.png')
gw, gh = 2048, 600                                                # the pattern picture: around the pot x up the pot
uu, vv = np.meshgrid(np.linspace(0, 1, gw, dtype=np.float32), np.linspace(1, 0, gh, dtype=np.float32))
circ = 2 * math.pi * POT_R1                                       # metres around
COLS_ = 6                                                         # diamonds around the pot
s_m = uu * circ; h_m = vv * POT_H
per = circ / COLS_
tri = np.abs(((s_m / per) % 1.0) - 0.5) * 2                        # 0..1..0 across each diamond
gold = np.zeros_like(uu)
for f in (tri, 1 - tri):                                          # the two zigzags, crossing: diamonds
    slope = 2 * POT_H / per
    d = np.abs(h_m - f * POT_H) / math.sqrt(1 + slope * slope)
    gold = np.maximum(gold, smoothstep(0.0042, 0.0032, d))     # each line about 7 mm wide, so it still shows from across the room
for hh in (0.0, POT_H):                                           # a thin band at the top and the foot
    gold = np.maximum(gold, smoothstep(0.008, 0.006, np.abs(h_m - hh)))
cv2.imwrite(GOLD, (gold * 255).astype(np.uint8))
pm, N, L = material('pot')
N.clear()
out = N.new('ShaderNodeOutputMaterial')
white = N.new('ShaderNodeBsdfPrincipled'); white.inputs['Base Color'].default_value = (0.86, 0.85, 0.82, 1)
white.inputs['Roughness'].default_value = 0.28; white.inputs['Coat Weight'].default_value = 0.3
metal = N.new('ShaderNodeBsdfPrincipled'); metal.inputs['Base Color'].default_value = (0.008, 0.008, 0.008, 1)   # (black lines, Oct 31: was gold)
metal.inputs['Roughness'].default_value = 0.3
gt = N.new('ShaderNodeTexImage'); gt.image = bpy.data.images.load(GOLD); gt.image.colorspace_settings.name = 'Non-Color'
mix = N.new('ShaderNodeMixShader')
L.new(gt.outputs['Color'], mix.inputs['Fac']); L.new(white.outputs[0], mix.inputs[1]); L.new(metal.outputs[0], mix.inputs[2])
L.new(mix.outputs[0], out.inputs['Surface'])
SEG = 128
verts, faces, uvs = [], [], []
def ring(r, z):
    for i in range(SEG + 1):
        a = 2 * math.pi * i / SEG
        verts.append((r * math.cos(a), r * math.sin(a), z))
rings = [(POT_R0, 0.0), (POT_R1, POT_H), (POT_R1 - POT_T, POT_H), (POT_R1 - POT_T, POT_H - 0.06), (0.0, 0.0)]
for r, z in rings: ring(r, z)
for k in range(len(rings) - 1):
    for i in range(SEG):
        a = k * (SEG + 1) + i
        faces.append((a, a + 1, a + SEG + 2, a + SEG + 1))
me = bpy.data.meshes.new('pot'); me.from_pydata(verts, [], faces)
uvl = me.uv_layers.new()
for poly in me.polygons:
    for li in poly.loop_indices:
        vi = me.loops[li].vertex_index; k, i = divmod(vi, SEG + 1)
        uvl.data[li].uv = (i / SEG, (verts[vi][2] / POT_H) if k == 0 or k == 1 else 0.5)   # (only the outside wears the pattern)
for p_ in me.polygons: p_.use_smooth = True
pot = bpy.data.objects.new('pot', me); pot.data.materials.append(pm); bpy.context.collection.objects.link(pot)
som, N, L = material('soil'); N['Principled BSDF'].inputs['Base Color'].default_value = (0.05, 0.035, 0.025, 1); N['Principled BSDF'].inputs['Roughness'].default_value = 1
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=POT_R1 - POT_T - 0.002, depth=0.02, location=(0, 0, POT_H - 0.05))
bpy.context.object.data.materials.append(som)

# ---------------------------------------------------------------- 3 · THE PLANT
# 37 leaves on slender stems, a full, rounded crown like the photo. Each leaf: az = which way it faces (0 = straight at
# the camera, + = to the camera's right), stem length (m), rise = how steeply the stem rises (deg), tilt = how far the
# leaf tips up from level (deg), L = leaf length (m), roll = a little twist, green = how wide its green edge is.
rr = random.Random(7)
LEAVES = []
for ring_, (count, rise0, slen0, tilt0) in enumerate([(9, 82, 0.95, 74), (10, 68, 0.78, 62), (9, 50, 0.6, 48), (9, 22, 0.42, 34)]):   # (the last ring spills over the rim, like the photo)
    for i in range(count):
        az = -180 + 360 * (i + 0.5 * (ring_ % 2)) / count + rr.uniform(-12, 12)
        LEAVES.append((az, slen0 * rr.uniform(0.88, 1.12), rise0 + rr.uniform(-6, 6), tilt0 + rr.uniform(-10, 10),
                       rr.uniform(0.37, 0.46), rr.uniform(-0.35, 0.35), rr.uniform(0.17, 0.28)))
for k, (az, slen, rise, tilt, Ln, roll, green) in enumerate(LEAVES):
    seed = 201 + k
    img, hp = leaf_picture(seed, green)
    mat = leaf_material(f'leafmat{k}', img, hp)
    a = math.radians(az); h = Vector((math.sin(a), -math.cos(a), 0))
    r = random.Random(seed)
    start = Vector((r.uniform(-0.06, 0.06), r.uniform(-0.06, 0.06), POT_H - 0.05))
    e = math.radians(rise)
    end = start + h * (slen * math.cos(e)) + Vector((0, 0, slen * math.sin(e)))
    ctrl = start + (end - start) * 0.5 + Vector((0, 0, slen * 0.15))
    stem([start, ctrl, end], 0.0055, sm, f'stem{k}')
    te = math.radians(tilt)
    mdir = h * math.cos(te) + Vector((0, 0, math.sin(te)))
    leaf_object(mat, Ln, end, mdir, roll, droop=0.22, fold=0.08, seed=seed)

# ---------------------------------------------------------------- 4 · LIGHT, FLOOR SHADOW, CAMERA
world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.62, 0.58, 0.53, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9
sun = bpy.data.lights.new('sky', 'SUN'); sun.energy = 3.2; sun.angle = math.radians(18); sun.color = (1.0, 0.95, 0.88)
so = bpy.data.objects.new('sky', sun); bpy.context.collection.objects.link(so)
so.rotation_euler = (math.radians(28), math.radians(-22), 0)          # high overhead, a little from the front left
fill = bpy.data.lights.new('fill', 'AREA'); fill.energy = 120; fill.size = 3; fill.color = (1.0, 0.86, 0.7)   # the warm bulbs nearby
fo = bpy.data.objects.new('fill', fill); bpy.context.collection.objects.link(fo)
fo.location = (1.6, -1.2, 1.9); fo.rotation_euler = (math.radians(60), 0, math.radians(55))
bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, 0))
floor = bpy.context.object; floor.is_shadow_catcher = True
cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'
cam.ortho_scale = 2.6
co = bpy.data.objects.new('cam', cam); bpy.context.collection.objects.link(co); scene.camera = co
TILT = math.radians(10)                                                  # looking down a little
co.rotation_euler = (math.radians(90) - TILT, 0, 0)
co.location = (0, -6 * math.cos(TILT), 1.0 + 6 * math.sin(TILT))
# PASS 1: the plant (the floor is only there to catch shadows; it isn't in this picture)
floor.hide_render = True
scene.render.filepath = os.path.join(TMP, 'render.png')
bpy.ops.render.render(write_still=True)
# PASS 2: the plant's shadow on the floor, on its own: the plant is hidden from the camera but still casts its shadow.
# (Shadows are soft, so this pass is taken at half size and fewer samples.)
floor.hide_render = False
for ob in scene.objects:
    if ob.type in ('MESH', 'CURVE') and ob is not floor: ob.visible_camera = False
scene.render.resolution_percentage = 50
scene.cycles.samples = max(8, SAMPLES // 3)
scene.render.filepath = os.path.join(TMP, 'shadow.png')
bpy.ops.render.render(write_still=True)

# ---------------------------------------------------------------- 5 · TRIM AND SAVE
im = cv2.imread(os.path.join(TMP, 'render.png'), cv2.IMREAD_UNCHANGED).astype(np.float32)
sh = cv2.imread(os.path.join(TMP, 'shadow.png'), cv2.IMREAD_UNCHANGED).astype(np.float32)
sh = cv2.resize(sh, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_CUBIC)
# keep only the shadow close around the pot: an oval on the floor (the floor is seen from a little above, so it's flat),
# fading out by about 0.7 m from the pot's middle
H_, W_ = im.shape[:2]
px_m = RES[0] / cam.ortho_scale
cx = W_ / 2
by = H_ / 2 + 1.0 * math.cos(TILT) * px_m       # the pot's foot: the camera aims at a point 1 m above it, so it's this far below the middle
yy, xx = np.mgrid[0:H_, 0:W_].astype(np.float32)
oval = np.exp(-(((xx - cx) / (0.7 * px_m)) ** 2 + ((yy - by) / (0.7 * px_m * math.sin(TILT) + 6)) ** 2))
sa = np.clip(sh[..., 3] / 255 * oval * 0.85, 0, 1)
pa = im[..., 3] / 255
# the plant over its shadow (the shadow is black, see-through by sa)
out_a = pa + sa * (1 - pa)
out_c = (im[..., :3] * pa[..., None]) / np.maximum(out_a, 1e-6)[..., None]
im = np.dstack([np.clip(out_c, 0, 255), np.clip(out_a * 255, 0, 255)]).astype(np.uint8)
a = im[..., 3]
ys, xs = np.where(a > 6)
pad = 6
y0, y1, x0, x1 = max(0, ys.min() - pad), min(a.shape[0], ys.max() + pad), max(0, xs.min() - pad), min(a.shape[1], xs.max() + pad)
crop = im[y0:y1, x0:x1]
os.makedirs(os.path.dirname(OUT), exist_ok=True)
rgba = cv2.cvtColor(crop, cv2.COLOR_BGRA2RGBA)
from PIL import Image
Image.fromarray(rgba, 'RGBA').save(OUT, 'WEBP', quality=88, method=6)
scale = cam.ortho_scale / RES[0]
print(f'wrote {OUT}  {crop.shape[1]} x {crop.shape[0]} px  = {crop.shape[1] * scale:.2f} m wide, {crop.shape[0] * scale:.2f} m tall')
print(f'  the pot\'s middle is {RES[0] / 2 - x0} px from the picture\'s left edge ({(RES[0] / 2 - x0) * scale:.3f} m)')
cols_ = np.where(crop[..., 3].max(0) > 40)[0]
print(f'  the leaves reach {(cols_.max() - (RES[0] / 2 - x0)) * scale:.3f} m to the right of the pot and {((RES[0] / 2 - x0) - cols_.min()) * scale:.3f} m to the left')
