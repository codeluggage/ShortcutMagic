FasdUAS 1.101.10   ��   ��    k             i         I      �� 	���� 0 readappname readAppName 	  
�� 
 o      ���� 0 argv  ��  ��    O     P    k    O       r        6      4   �� 
�� 
prcs  m    ����   =  	     n   
     1   
 ��
�� 
pisf   g   
 
  m    ��
�� boovtrue  o      ���� $0 frontmostprocess frontmostProcess      r        m    ��
�� boovfals  n          1    ��
�� 
pvis  o    ���� $0 frontmostprocess frontmostProcess       l   ��������  ��  ��      ! " ! V    . # $ # I  $ )�� %��
�� .sysodelanull��� ��� nmbr % m   $ % & & ?���������   $ l   # '���� ' =   # ( ) ( n    ! * + * 1    !��
�� 
pisf + o    ���� $0 frontmostprocess frontmostProcess ) m   ! "��
�� boovtrue��  ��   "  , - , l  / /��������  ��  ��   -  . / . r   / @ 0 1 0 6 / > 2 3 2 n   / 5 4 5 4 1   3 5��
�� 
pnam 5 4  / 3�� 6
�� 
prcs 6 m   1 2����  3 =  6 = 7 8 7 n   7 9 9 : 9 1   7 9��
�� 
pisf :  g   7 7 8 m   : <��
�� boovtrue 1 o      ���� 0 
targetname 
targetName /  ; < ; r   A F = > = m   A B��
�� boovtrue > n       ? @ ? 1   C E��
�� 
pisf @ o   B C���� $0 frontmostprocess frontmostProcess <  A B A r   G L C D C m   G H��
�� boovtrue D n       E F E 1   I K��
�� 
pvis F o   H I���� $0 frontmostprocess frontmostProcess B  G H G l  M M��������  ��  ��   H  I�� I L   M O J J o   M N���� 0 
targetname 
targetName��    m      K K�                                                                                  sevs  alis    �  Macintosh HD               ��@rH+  :�System Events.app                                              N&���        ����  	                CoreServices    ��x�      ���    :�:�:�  =Macintosh HD:System: Library: CoreServices: System Events.app   $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��     L M L l     ��������  ��  ��   M  N O N i     P Q P I     �� R��
�� .aevtoappnull  �   � **** R l      S���� S o      ���� 0 argv  ��  ��  ��   Q L      T T I     �� U���� 0 readappname readAppName U  V�� V o    ���� 0 argv  ��  ��   O  W X W l     ��������  ��  ��   X  Y Z Y l     ��������  ��  ��   Z  [ \ [ l     �� ] ^��   ] @ :- potentially use this to avoid selecting SW as first app:    ^ � _ _ t -   p o t e n t i a l l y   u s e   t h i s   t o   a v o i d   s e l e c t i n g   S W   a s   f i r s t   a p p : \  ` a ` l     ��������  ��  ��   a  b c b l     �� d e��   d ' ! tell application "System Events"    e � f f B   t e l l   a p p l i c a t i o n   " S y s t e m   E v e n t s " c  g h g l     �� i j��   i F @     set frontmostProcess to first process where it is frontmost    j � k k �           s e t   f r o n t m o s t P r o c e s s   t o   f i r s t   p r o c e s s   w h e r e   i t   i s   f r o n t m o s t h  l m l l     �� n o��   n 3 -     set visible of frontmostProcess to false    o � p p Z           s e t   v i s i b l e   o f   f r o n t m o s t P r o c e s s   t o   f a l s e m  q r q l     �� s t��   s 7 1     repeat while (frontmostProcess is frontmost)    t � u u b           r e p e a t   w h i l e   ( f r o n t m o s t P r o c e s s   i s   f r o n t m o s t ) r  v w v l     �� x y��   x           delay 0.2    y � z z $                   d e l a y   0 . 2 w  { | { l     �� } ~��   }       end repeat    ~ �              e n d   r e p e a t |  � � � l     �� � ���   � M G     set secondFrontmost to name of first process where it is frontmost    � � � � �           s e t   s e c o n d F r o n t m o s t   t o   n a m e   o f   f i r s t   p r o c e s s   w h e r e   i t   i s   f r o n t m o s t �  � � � l     �� � ���   � 4 .     set frontmost of frontmostProcess to true    � � � � \           s e t   f r o n t m o s t   o f   f r o n t m o s t P r o c e s s   t o   t r u e �  � � � l     �� � ���   �  	 end tell    � � � �    e n d   t e l l �  � � � l     ��������  ��  ��   �  � � � l     �� � ���   � ? 9 tell application (path to frontmost application as text)    � � � � r   t e l l   a p p l i c a t i o n   ( p a t h   t o   f r o n t m o s t   a p p l i c a t i o n   a s   t e x t ) �  � � � l     �� � ���   � 1 +     if "Finder" is in secondFrontmost then    � � � � V           i f   " F i n d e r "   i s   i n   s e c o n d F r o n t m o s t   t h e n �  � � � l     �� � ���   � : 4         display dialog ("Finder was last in front")    � � � � h                   d i s p l a y   d i a l o g   ( " F i n d e r   w a s   l a s t   i n   f r o n t " ) �  � � � l     �� � ���   �  	     else    � � � �            e l s e �  � � � l     �� � ���   � F @         display dialog (secondFrontmost & " was last in front")    � � � � �                   d i s p l a y   d i a l o g   ( s e c o n d F r o n t m o s t   &   "   w a s   l a s t   i n   f r o n t " ) �  � � � l     �� � ���   �       end if    � � � �            e n d   i f �  � � � l     �� � ���   �  	 end tell    � � � �    e n d   t e l l �  ��� � l     ��������  ��  ��  ��       �� � � ���   � ������ 0 readappname readAppName
�� .aevtoappnull  �   � **** � �� ���� � ����� 0 readappname readAppName�� �� ���  �  ���� 0 argv  ��   � �������� 0 argv  �� $0 frontmostprocess frontmostProcess�� 0 
targetname 
targetName �  K�� ����� &����
�� 
prcs �  
�� 
pisf
�� 
pvis
�� .sysodelanull��� ��� nmbr
�� 
pnam�� Q� M*�k/�[�,\Ze81E�Of��,FO h��,e �j [OY��O*�k/�,�[�,\Ze81E�Oe��,FOe��,FO�U � �� Q���� � ���
�� .aevtoappnull  �   � ****�� 0 argv  ��   � ���� 0 argv   � ���� 0 readappname readAppName�� *�k+   ascr  ��ޭ